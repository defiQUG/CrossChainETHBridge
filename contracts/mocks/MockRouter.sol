// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouter.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../security/RateLimiter.sol";

abstract contract MockRouter is IRouter, ReentrancyGuard, RateLimiter {
    using Client for Client.Any2EVMMessage;
    using Client for Client.EVM2AnyMessage;

    mapping(uint64 => bool) internal _supportedChains;
    mapping(uint64 => address[]) internal _supportedTokens;
    mapping(uint64 => address) internal _onRamps;
    mapping(uint64 => mapping(address => bool)) internal _offRamps;

    uint256 internal constant _baseFee = 0.001 ether;
    uint256 internal constant _extraFee = 0.0005 ether;

    event MessageReceived(bytes32 indexed messageId, uint64 indexed sourceChainSelector, Client.Any2EVMMessage message);
    event MessageSimulated(address indexed target, bytes32 indexed messageId);
    event MessageSent(bytes32 indexed messageId, uint64 indexed destinationChainSelector, Client.EVM2AnyMessage message);

    constructor() RateLimiter(100, 1 hours) {
        _supportedChains[137] = true; // Polygon PoS
        _supportedChains[138] = true; // Defi Oracle Meta
    }

    function getOnRamp(uint64 destChainSelector) external view returns (address) {
        return _onRamps[destChainSelector];
    }

    function isOffRamp(uint64 sourceChainSelector, address offRamp) external view returns (bool) {
        return _offRamps[sourceChainSelector][offRamp];
    }

    function routeMessage(
        Client.Any2EVMMessage calldata message,
        uint16 gasForCallExactCheck,
        uint256 gasLimit,
        address receiver
    ) external virtual returns (bool success, bytes memory retBytes, uint256 gasUsed) {
        require(_supportedChains[message.sourceChainSelector], "Chain not supported");
        require(validateMessage(message), "Invalid message");
        require(processMessage(), "Rate limit exceeded");

        uint256 startGas = gasleft();

        (success, retBytes) = receiver.call{gas: gasLimit}(message.data);

        gasUsed = startGas - gasleft();

        if (success && gasForCallExactCheck > 0) {
            require(gasUsed <= gasLimit, "Exceeded gas limit");
        }

        emit MessageReceived(message.messageId, message.sourceChainSelector, message);

        return (success, retBytes, gasUsed);
    }

    function validateMessage(Client.Any2EVMMessage memory message) public pure virtual returns (bool) {
        if (message.sourceChainSelector == 0) {
            revert("Invalid chain selector");
        }
        if (message.sender.length == 0) {
            revert("Invalid sender");
        }
        if (message.data.length < 4) {
            revert("Invalid data length");
        }
        return true;
    }

    function simulateMessageReceived(
        address target,
        Client.Any2EVMMessage memory message
    ) external virtual whenNotPaused {
        require(target != address(0), "Invalid target address");
        require(validateMessage(message), "Message validation failed");
        require(processMessage(), "Rate limit exceeded");

        bytes32 messageId = keccak256(abi.encode(message));
        emit MessageSimulated(target, messageId);

        (bool success, ) = target.call(message.data);
        require(success, "Message simulation failed");
    }

    receive() external payable virtual {}
}
