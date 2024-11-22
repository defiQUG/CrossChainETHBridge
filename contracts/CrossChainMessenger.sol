// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouter.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./RateLimiter.sol";

interface IWETH {
    function deposit() external payable;
    function withdraw(uint256) external;
    function transfer(address to, uint256 value) external returns (bool);
}

contract CrossChainMessenger is ReentrancyGuard, Pausable, Ownable, RateLimiter {
    using Client for Client.EVM2AnyMessage;

    IRouterClient public immutable router;
    IWETH public immutable weth;
    uint64 public constant POLYGON_CHAIN_SELECTOR = 137;
    uint256 public bridgeFee;

    event MessageSent(bytes32 indexed messageId, address indexed sender, address indexed recipient, uint256 amount);
    event MessageReceived(bytes32 indexed messageId, address indexed sender, address indexed recipient, uint256 amount);
    event BridgeFeeUpdated(uint256 newFee);
    event EmergencyWithdraw(address indexed recipient, uint256 amount);

    constructor(address _router, address _weth, uint256 _maxMessagesPerPeriod) RateLimiter(_maxMessagesPerPeriod) {
        require(_router != address(0), "CrossChainMessenger: zero router address");
        require(_weth != address(0), "CrossChainMessenger: zero WETH address");
        router = IRouterClient(_router);
        weth = IWETH(_weth);
        bridgeFee = 0.1 ether;
        _transferOwnership(msg.sender);
    }

    function getRouter() external view returns (address) {
        return address(router);
    }

    function getBridgeFee() external view returns (uint256) {
        return bridgeFee;
    }

    function sendToPolygon(address _recipient) external payable nonReentrant whenNotPaused {
        require(msg.value > bridgeFee, "CrossChainMessenger: insufficient payment");
        require(_recipient != address(0), "CrossChainMessenger: zero recipient address");

        // Process message through rate limiter
        _processMessage();  // Changed to use internal function

        uint256 transferAmount = msg.value - bridgeFee;
        bytes memory data = abi.encode(_recipient, transferAmount);

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(_recipient),
            data: data,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: "",
            feeToken: address(0)
        });

        bytes32 messageId = router.ccipSend{value: msg.value}(
            POLYGON_CHAIN_SELECTOR,
            message
        );

        emit MessageSent(messageId, msg.sender, _recipient, transferAmount);
    }

    function ccipReceive(Client.Any2EVMMessage calldata message) external whenNotPaused {
        require(msg.sender == address(router), "CrossChainMessenger: caller is not router");
        require(message.sourceChainSelector == 138, "CrossChainMessenger: invalid source chain");  // Must be from Defi Oracle Meta

        // Process message through rate limiter
        _processMessage();  // Changed to use internal function

        address sender = address(bytes20(message.sender));
        (address recipient, uint256 amount) = abi.decode(message.data, (address, uint256));

        require(recipient != address(0), "CrossChainMessenger: zero recipient address");
        require(amount > 0, "CrossChainMessenger: zero amount");
        require(address(this).balance >= amount, "CrossChainMessenger: insufficient balance");

        // Convert ETH to WETH and transfer to recipient
        weth.deposit{value: amount}();
        require(weth.transfer(recipient, amount), "CrossChainMessenger: WETH transfer failed");

        emit MessageReceived(message.messageId, sender, recipient, amount);
    }

    function setBridgeFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1 ether, "CrossChainMessenger: fee exceeds maximum");
        bridgeFee = _newFee;
        emit BridgeFeeUpdated(_newFee);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw(address payable _recipient) external onlyOwner whenPaused {
        require(_recipient != address(0), "CrossChainMessenger: zero recipient address");
        uint256 balance = address(this).balance;
        (bool success, ) = _recipient.call{value: balance}("");
        require(success, "CrossChainMessenger: transfer failed");
        emit EmergencyWithdraw(_recipient, balance);
    }

    receive() external payable {}
}
