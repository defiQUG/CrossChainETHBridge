// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouter.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./security/RateLimiter.sol";
import "./security/EmergencyPause.sol";

interface IWETH {
    function deposit() external payable;
    function withdraw(uint256) external;
    function transfer(address to, uint256 value) external returns (bool);
    receive() external payable;
}

contract CrossChainMessenger is Ownable, ReentrancyGuard {
    using Client for Client.EVM2AnyMessage;

    IRouterClient public immutable router;
    IWETH public immutable weth;
    uint64 public constant POLYGON_CHAIN_SELECTOR = 137;
    uint64 public constant DEFI_ORACLE_META_CHAIN_SELECTOR = 138;
    uint256 public bridgeFee;
    uint256 public constant MAX_FEE = 1 ether;

    RateLimiter private rateLimiter;
    EmergencyPause private emergencyPause;

    // Track processed messages to prevent replay attacks
    mapping(bytes32 => bool) private processedMessages;

    event MessageSent(bytes32 indexed messageId, address indexed sender, address indexed recipient, uint256 amount);
    event MessageReceived(bytes32 indexed messageId, address indexed sender, address indexed recipient, uint256 amount);
    event BridgeFeeUpdated(uint256 newFee);
    event EmergencyWithdraw(address indexed recipient, uint256 amount);

    constructor(
        address _router,
        address _weth,
        address _rateLimiter,
        address _emergencyPause,
        uint256 _bridgeFee,
        uint256 _maxFee
    ) {
        require(_router != address(0), "CrossChainMessenger: zero router address");
        require(_weth != address(0), "CrossChainMessenger: zero WETH address");
        require(_rateLimiter != address(0), "CrossChainMessenger: zero rate limiter address");
        require(_emergencyPause != address(0), "CrossChainMessenger: zero emergency pause address");
        require(_bridgeFee <= _maxFee, "CrossChainMessenger: fee exceeds maximum");

        router = IRouterClient(_router);
        weth = IWETH(_weth);
        rateLimiter = RateLimiter(_rateLimiter);
        emergencyPause = EmergencyPause(_emergencyPause);
        bridgeFee = _bridgeFee;
    }

    function getRouter() external view returns (address) {
        return address(router);
    }

    function getBridgeFee() external view returns (uint256) {
        return bridgeFee;
    }

    function sendToPolygon(address _recipient) external payable nonReentrant {
        require(!emergencyPause.paused(), "CrossChainMessenger: contract is paused");
        require(_recipient != address(0), "CrossChainMessenger: zero recipient address");
        require(msg.value > 0, "CrossChainMessenger: zero amount");

        bytes memory data = abi.encode(_recipient, msg.value);
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(_recipient),
            data: data,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: "",
            feeToken: address(0)
        });

        uint256 requiredFee = router.getFee(POLYGON_CHAIN_SELECTOR, message);
        require(msg.value >= requiredFee, "CrossChainMessenger: insufficient payment");

        uint256 transferAmount = msg.value - requiredFee;
        require(transferAmount > 0, "CrossChainMessenger: amount too small");

        // Check rate limit and emergency pause before processing
        rateLimiter.processMessage();
        emergencyPause.checkAndUpdateValue(transferAmount);

        bytes32 messageId = router.ccipSend{value: requiredFee}(
            POLYGON_CHAIN_SELECTOR,
            message
        );

        emit MessageSent(messageId, msg.sender, _recipient, transferAmount);
    }

    function ccipReceive(Client.Any2EVMMessage calldata message) external {
        require(!emergencyPause.paused(), "CrossChainMessenger: contract is paused");
        require(msg.sender == address(router), "CrossChainMessenger: caller is not router");
        require(message.sourceChainSelector == DEFI_ORACLE_META_CHAIN_SELECTOR, "CrossChainMessenger: invalid source chain");
        require(!processedMessages[message.messageId], "CrossChainMessenger: message already processed");

        (address recipient, uint256 amount) = abi.decode(message.data, (address, uint256));

        require(recipient != address(0), "CrossChainMessenger: zero recipient address");
        require(amount > 0, "CrossChainMessenger: zero amount");
        require(address(this).balance >= amount, "CrossChainMessenger: insufficient balance");

        // Mark message as processed before state changes
        processedMessages[message.messageId] = true;

        // Check rate limit and emergency pause
        rateLimiter.processMessage();
        emergencyPause.checkAndUpdateValue(amount);

        // Handle WETH operations with proper error checking
        try weth.deposit{value: amount}() {
            bool success = weth.transfer(recipient, amount);
            require(success, "CrossChainMessenger: WETH transfer failed");
        } catch {
            revert("CrossChainMessenger: WETH deposit failed");
        }

        emit MessageReceived(message.messageId, address(bytes20(message.sender)), recipient, amount);
    }

    function setBridgeFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= MAX_FEE, "CrossChainMessenger: fee exceeds maximum");
        bridgeFee = _newFee;
        emit BridgeFeeUpdated(_newFee);
    }

    function emergencyWithdraw(address payable _recipient) external onlyOwner {
        require(emergencyPause.paused(), "CrossChainMessenger: contract not paused");
        require(_recipient != address(0), "CrossChainMessenger: zero recipient address");
        uint256 balance = address(this).balance;
        require(balance > 0, "CrossChainMessenger: no balance to withdraw");
        (bool success, ) = _recipient.call{value: balance}("");
        require(success, "CrossChainMessenger: transfer failed");
        emit EmergencyWithdraw(_recipient, balance);
    }

    receive() external payable {}
}
