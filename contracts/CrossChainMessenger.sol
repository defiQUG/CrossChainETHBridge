// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouter.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RateLimiter.sol";
import "./EmergencyPause.sol";

interface IWETH {
    function deposit() external payable;
    function withdraw(uint256) external;
    function transfer(address to, uint256 value) external returns (bool);
}

contract CrossChainMessenger is Ownable, ReentrancyGuard {
    using Client for Client.EVM2AnyMessage;

    IRouterClient public immutable router;
    IWETH public immutable weth;
    uint64 public constant POLYGON_CHAIN_SELECTOR = 137;
    uint256 public bridgeFee;
    uint256 public constant MAX_FEE = 1 ether;

    RateLimiter private rateLimiter;
    EmergencyPause private emergencyPause;

    event MessageSent(bytes32 indexed messageId, address indexed sender, address indexed recipient, uint256 amount);
    event MessageReceived(bytes32 indexed messageId, address indexed sender, address indexed recipient, uint256 amount);
    event BridgeFeeUpdated(uint256 newFee);
    event EmergencyWithdraw(address indexed recipient, uint256 amount);

    constructor(
        address _router,
        address _weth,
        uint256 _bridgeFee,
        uint256 _maxMessagesPerPeriod,
        uint256 _pauseThreshold,
        uint256 _pauseDuration
    ) Ownable(msg.sender) {
        require(_router != address(0), "CrossChainMessenger: zero router address");
        require(_weth != address(0), "CrossChainMessenger: zero WETH address");
        require(_bridgeFee <= MAX_FEE, "CrossChainMessenger: fee exceeds maximum");

        router = IRouterClient(_router);
        weth = IWETH(_weth);
        bridgeFee = _bridgeFee;

        rateLimiter = new RateLimiter(_maxMessagesPerPeriod, 3600);
        emergencyPause = new EmergencyPause(_pauseThreshold, _pauseDuration);
    }

    function getRouter() external view returns (address) {
        return address(router);
    }

    function getBridgeFee() external view returns (uint256) {
        return bridgeFee;
    }

    function sendToPolygon(address _recipient) external payable nonReentrant {
        require(!emergencyPause.isPaused(), "CrossChainMessenger: contract is paused");
        require(msg.value > bridgeFee, "CrossChainMessenger: insufficient payment");
        require(_recipient != address(0), "CrossChainMessenger: zero recipient address");

        uint256 transferAmount = msg.value - bridgeFee;
        rateLimiter._checkAndUpdateRateLimit();
        emergencyPause._checkAndPause(transferAmount);

        bytes memory data = abi.encode(_recipient, transferAmount);
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(_recipient),
            data: data,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: "",
            feeToken: address(0)
        });

        bytes32 messageId = router.ccipSend{value: bridgeFee}(
            POLYGON_CHAIN_SELECTOR,
            message
        );

        emit MessageSent(messageId, msg.sender, _recipient, transferAmount);
    }

    function ccipReceive(Client.Any2EVMMessage calldata message) external {
        require(!emergencyPause.isPaused(), "CrossChainMessenger: contract is paused");
        require(msg.sender == address(router), "CrossChainMessenger: caller is not router");
        require(message.sourceChainSelector == 138, "CrossChainMessenger: invalid source chain");

        (address recipient, uint256 amount) = abi.decode(message.data, (address, uint256));

        require(recipient != address(0), "CrossChainMessenger: zero recipient address");
        require(amount > 0, "CrossChainMessenger: zero amount");
        require(address(this).balance >= amount, "CrossChainMessenger: insufficient balance");

        rateLimiter._checkAndUpdateRateLimit();
        emergencyPause._checkAndPause(amount);

        weth.deposit{value: amount}();
        require(weth.transfer(recipient, amount), "CrossChainMessenger: WETH transfer failed");

        emit MessageReceived(message.messageId, address(bytes20(message.sender)), recipient, amount);
    }

    function setBridgeFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= MAX_FEE, "CrossChainMessenger: fee exceeds maximum");
        bridgeFee = _newFee;
        emit BridgeFeeUpdated(_newFee);
    }

    function emergencyWithdraw(address payable _recipient) external onlyOwner {
        require(emergencyPause.isPaused(), "CrossChainMessenger: contract not paused");
        require(_recipient != address(0), "CrossChainMessenger: zero recipient address");
        uint256 balance = address(this).balance;
        require(balance > 0, "CrossChainMessenger: no balance to withdraw");
        (bool success, ) = _recipient.call{value: balance}("");
        require(success, "CrossChainMessenger: transfer failed");
        emit EmergencyWithdraw(_recipient, balance);
    }

    receive() external payable {}
}
