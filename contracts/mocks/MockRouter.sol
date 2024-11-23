// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouter.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../security/RateLimiter.sol";

abstract contract MockRouter is IRouter, ReentrancyGuard, RateLimiter {
    using Client for Client.Any2EVMMessage;
    using Client for Client.EVM2AnyMessage;

    mapping(uint64 => bool) private _supportedChains;
    mapping(uint64 => address) private _onRamps;
    mapping(uint64 => mapping(address => bool)) private _offRamps;
    uint256 private constant _baseFee = 0.1 ether;
    uint256 private constant _extraFee = 0.05 ether;
    mapping(uint64 => address[]) private _supportedTokens;

    event MessageReceived(bytes32 messageId);
    event MessageSimulated(address indexed target, bytes32 messageId);
    event MessageSent(uint64 indexed chainSelector, bytes data);

    constructor()
        RateLimiter(100, 1 hours)  // 100 messages per hour
    {
        _supportedChains[137] = true; // Only Polygon PoS is supported
    }

    function isChainSupported(uint64 chainSelector) external view returns (bool) {
        return _supportedChains[chainSelector];
    }

    function getSupportedTokens(uint64 chainSelector) external view returns (address[] memory) {
        require(_supportedChains[chainSelector], "Chain not supported");
        return _supportedTokens[chainSelector];
    }

    function getOnRamp(uint64 destChainSelector) external view returns (address) {
        return _onRamps[destChainSelector];
    }

    function isOffRamp(uint64 sourceChainSelector, address offRamp) external view returns (bool) {
        return _offRamps[sourceChainSelector][offRamp];
    }

    function routeMessage(
        uint64 destinationChainSelector,
        bytes calldata receiver,
        bytes calldata message,
        address feeToken,
        uint256 feeAmount
    ) external payable virtual returns (bytes32) {
        require(_supportedChains[destinationChainSelector], "Chain not supported");
        require(msg.value >= feeAmount, "Insufficient fee");
        require(processMessage(), "Rate limit exceeded");

        bytes32 messageId = keccak256(abi.encode(
            destinationChainSelector,
            receiver,
            message,
            feeToken,
            feeAmount
        ));

        emit MessageSent(destinationChainSelector, message);
        return messageId;
    }

    function getFee(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) public view returns (uint256) {
        require(_supportedChains[destinationChainSelector], "Chain not supported");
        uint256 totalFee = _baseFee;
        if (message.tokenAmounts.length > 0) {
            totalFee += _extraFee;
        }
        return totalFee;
    }

    function ccipSend(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) external payable virtual returns (bytes32) {
        require(_supportedChains[destinationChainSelector], "Chain not supported");
        require(processMessage(), "Rate limit exceeded");

        uint256 requiredFee = getFee(destinationChainSelector, message);
        require(msg.value >= requiredFee, "Insufficient fee");

        bytes memory encodedMessage = abi.encode(
            message.receiver,
            message.data,
            message.tokenAmounts,
            message.extraArgs,
            message.feeToken
        );

        emit MessageSent(destinationChainSelector, encodedMessage);

        if (msg.value > requiredFee) {
            payable(msg.sender).transfer(msg.value - requiredFee);
        }

        return keccak256(encodedMessage);
    }

    function validateMessage(Client.Any2EVMMessage memory message) public pure returns (bool) {
        if (message.sourceChainSelector == 0) {
            revert("Invalid chain selector");
        }
        if (message.sender.length == 0) {
            revert("Invalid sender");
        }
        if (message.data.length < 64) {
            revert("Invalid data");
        }
        return true;
    }

    function simulateMessageReceived(
        address target,
        Client.Any2EVMMessage memory message
    ) external whenNotPaused {
        require(target != address(0), "Invalid target address");
        require(validateMessage(message), "Message validation failed");
        require(processMessage(), "Rate limit exceeded");

        bytes32 messageId = keccak256(abi.encode(message));
        emit MessageSimulated(target, messageId);

        (bool success, ) = target.call(message.data);
        require(success, "Message simulation failed");
    }

    function ccipReceive(
        Client.Any2EVMMessage memory message
    ) external virtual whenNotPaused {
        require(validateMessage(message), "Invalid message");
        require(processMessage(), "Rate limit exceeded");

        bytes32 messageId = keccak256(abi.encode(message));
        emit MessageReceived(messageId);
    }

    receive() external payable {}
}
