// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouter.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./RateLimiter.sol";

interface IWETH {
    function deposit() external payable;
    function withdraw(uint256) external;
    function transfer(address to, uint256 value) external returns (bool);
}

contract CrossChainMessenger is OwnerIsCreator, ReentrancyGuard, Pausable, RateLimiter {
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
        require(_router != address(0), "Invalid router address");
        require(_weth != address(0), "Invalid WETH address");
        router = IRouterClient(_router);
        weth = IWETH(_weth);
        bridgeFee = 0.1 ether;
    }

    function getRouter() external view returns (address) {
        return address(router);
    }

    function getBridgeFee() external view returns (uint256) {
        return bridgeFee;
    }

    function sendToPolygon(address _recipient) external payable nonReentrant whenNotPaused {
        require(msg.value > bridgeFee, "Insufficient amount");
        require(_recipient != address(0), "Invalid recipient");

        // Process message through rate limiter
        processMessage();

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
        require(msg.sender == address(router), "Unauthorized sender");
        require(message.sourceChainSelector == 138, "Invalid source chain");  // Must be from Defi Oracle Meta

        // Process message through rate limiter
        processMessage();

        address sender = address(bytes20(message.sender));
        (address recipient, uint256 amount) = abi.decode(message.data, (address, uint256));

        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount, "Insufficient balance");

        // Convert ETH to WETH and transfer to recipient
        weth.deposit{value: amount}();
        require(weth.transfer(recipient, amount), "WETH transfer failed");

        emit MessageReceived(message.messageId, sender, recipient, amount);
    }

    function updateBridgeFee(uint256 _newFee) external onlyOwner {
        bridgeFee = _newFee;
        emit BridgeFeeUpdated(_newFee);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw(address payable _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid recipient");
        uint256 balance = address(this).balance;
        (bool success, ) = _recipient.call{value: balance}("");
        require(success, "Transfer failed");
        emit EmergencyWithdraw(_recipient, balance);
    }

    receive() external payable {}
}
