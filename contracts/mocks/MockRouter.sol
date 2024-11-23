// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouter.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MockRouter is IRouter, ReentrancyGuard {
    using Client for Client.Any2EVMMessage;
    using Client for Client.EVM2AnyMessage;

    mapping(uint64 => bool) private _supportedChains;
    uint256 private constant _baseFee = 0.1 ether;
    uint256 private constant _extraFee = 0.05 ether;
    mapping(uint64 => address[]) private _supportedTokens;

    event MessageReceived(bytes32 messageId);
    event MessageSimulated(address indexed target, bytes32 messageId);
    event MessageSent(uint64 indexed chainSelector, bytes data);

    constructor() {
        _supportedChains[137] = true; // Only Polygon PoS is supported
    }

    function isChainSupported(uint64 chainSelector) external view override returns (bool) {
        return _supportedChains[chainSelector];
    }

    function getSupportedTokens(uint64 chainSelector) external view returns (address[] memory) {
        require(_supportedChains[chainSelector], "Chain not supported");
        return _supportedTokens[chainSelector];
    }

    function getFee(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) public view override returns (uint256) {
        require(_supportedChains[destinationChainSelector], "Chain not supported");
        uint256 totalFee = _baseFee;
        if (message.tokenAmounts.length > 0) {
            totalFee += _extraFee;
        }
        return totalFee;
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

    function ccipSend(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) external payable override returns (bytes32) {
        require(_supportedChains[destinationChainSelector], "Chain not supported");
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

    function simulateMessageReceived(
        address target,
        Client.Any2EVMMessage memory message
    ) external {
        require(target != address(0), "Invalid target address");
        require(validateMessage(message), "Message validation failed");

        bytes32 messageId = keccak256(abi.encode(message));
        emit MessageSimulated(target, messageId);

        (bool success, ) = target.call(message.data);
        require(success, "Message simulation failed");
    }

    function ccipReceive(
        Client.Any2EVMMessage memory message
    ) external override {
        require(validateMessage(message), "Invalid message");
        bytes32 messageId = keccak256(abi.encode(message));
        emit MessageReceived(messageId);
    }

    receive() external payable {}
}
