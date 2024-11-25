// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { IRouter } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouter.sol";
import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/security/Pausable.sol";
import { RateLimiter } from "./security/RateLimiter.sol";
import { EmergencyPause } from "./security/EmergencyPause.sol";
import { IWETH } from "./interfaces/IWETH.sol";

contract CrossChainMessenger is Ownable, ReentrancyGuard, Pausable {
    using Client for Client.EVM2AnyMessage;

    IRouterClient public immutable ROUTER;
    IWETH public immutable WETH;
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
        address payable _weth,
        address _rateLimiter,
        address _emergencyPause,
        uint256 _bridgeFee,
        uint256 _maxFee
    ) {
        require(_router != address(0), "Invalid router address");
        require(_weth != address(0), "Invalid WETH address");
        require(_rateLimiter != address(0), "Invalid rate limiter address");
        require(_emergencyPause != address(0), "Invalid emergency pause address");
        require(_bridgeFee <= _maxFee, "Fee exceeds maximum");

        ROUTER = IRouterClient(_router);
        WETH = IWETH(_weth);
        rateLimiter = RateLimiter(_rateLimiter);
        emergencyPause = EmergencyPause(_emergencyPause);
        bridgeFee = _bridgeFee;
    }

    function getRouter() external view returns (address) {
        return address(ROUTER);
    }

    function getBridgeFee() external view returns (uint256) {
        return bridgeFee;
    }

    function sendToPolygon(address _recipient) external payable nonReentrant whenNotPaused {
        require(_recipient != address(0), "Invalid recipient address");
        require(msg.value > 0, "Zero amount");

        // Check emergency pause state first
        require(!emergencyPause.paused(), "Contract is paused");

        bytes memory data = abi.encode(_recipient, msg.value);
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(_recipient),
            data: data,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: "",
            feeToken: address(0)
        });

        uint256 requiredFee = ROUTER.getFee(POLYGON_CHAIN_SELECTOR, message) + bridgeFee;
        require(msg.value >= requiredFee, "Insufficient payment");

        uint256 transferAmount = msg.value - requiredFee;
        require(transferAmount > 0, "Amount too small");

        // Check rate limit and emergency pause before processing
        rateLimiter.processMessage();
        emergencyPause.checkAndUpdateValue(transferAmount);

        bytes32 messageId = ROUTER.ccipSend{value: requiredFee}(
            POLYGON_CHAIN_SELECTOR,
            message
        );

        emit MessageSent(messageId, msg.sender, _recipient, transferAmount);
    }

    function ccipReceive(Client.Any2EVMMessage calldata message) external whenNotPaused {
        require(msg.sender == address(ROUTER), "Caller is not router");
        require(message.sourceChainSelector == DEFI_ORACLE_META_CHAIN_SELECTOR, "Invalid source chain");
        require(!processedMessages[message.messageId], "Message already processed");

        (address recipient, uint256 amount) = abi.decode(message.data, (address, uint256));

        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Zero amount");
        require(address(this).balance >= amount, "Insufficient balance");

        // Mark message as processed before state changes
        processedMessages[message.messageId] = true;

        // Check rate limit and emergency pause
        rateLimiter.processMessage();
        emergencyPause.checkAndUpdateValue(amount);

        // Handle WETH operations with proper error checking
        try WETH.deposit{value: amount}() {
            bool success = WETH.transfer(recipient, amount);
            require(success, "WETH transfer failed");
        } catch {
            revert("WETH deposit failed");
        }

        emit MessageReceived(message.messageId, address(bytes20(message.sender)), recipient, amount);
    }

    function setBridgeFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= MAX_FEE, "Fee exceeds maximum");
        bridgeFee = _newFee;
        emit BridgeFeeUpdated(_newFee);
    }

    function emergencyWithdraw(address payable _recipient) external onlyOwner whenPaused {
        require(_recipient != address(0), "Invalid recipient address");
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        (bool success, ) = _recipient.call{value: balance}("");
        require(success, "Transfer failed");
        emit EmergencyWithdraw(_recipient, balance);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    receive() external payable {}
}
