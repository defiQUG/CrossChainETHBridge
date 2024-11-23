// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MockRouter.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";

// Chain selectors for supported networks
uint64 constant DEFI_ORACLE_META_CHAIN_SELECTOR = 138;
uint64 constant POLYGON_CHAIN_SELECTOR = 137;

contract TestRouter is MockRouter, IRouterClient {
    constructor() {
        // Initialize supported chains
        _supportedChains[DEFI_ORACLE_META_CHAIN_SELECTOR] = true;
        _supportedChains[POLYGON_CHAIN_SELECTOR] = true;
    }

    function isChainSupported(uint64 destChainSelector) external view override returns (bool) {
        return _supportedChains[destChainSelector];
    }

    function getSupportedTokens(uint64 chainSelector) external view returns (address[] memory) {
        require(_supportedChains[chainSelector], "Chain not supported");
        return new address[](0);
    }

    function getFee(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) public view override(MockRouter, IRouterClient) returns (uint256) {
        require(_supportedChains[destinationChainSelector], "Chain not supported");
        return 100000000000000000; // 0.1 ETH
    }

    function validateMessage(Client.Any2EVMMessage memory message) public pure override returns (bool) {
        if (message.messageId == bytes32(0)) {
            revert("Invalid message ID");
        }
        if (message.sourceChainSelector == 0) {
            revert("Chain not supported");
        }
        if (message.sender.length != 20) {
            revert("Invalid sender length");
        }
        if (message.data.length == 0) {
            revert("Empty message data");
        }
        return true;
    }

    function routeMessage(
        Client.Any2EVMMessage calldata message,
        uint16 gasForCallExactCheck,
        uint256 gasLimit,
        address receiver
    ) external override returns (bool success, bytes memory retBytes, uint256 gasUsed) {
        require(_supportedChains[message.sourceChainSelector], "Chain not supported");
        require(validateMessage(message), "Invalid message");
        require(processMessage(), "Rate limit exceeded");

        uint256 startGas = gasleft();
        (success, retBytes) = receiver.call{gas: gasLimit}(message.data);
        gasUsed = startGas - gasleft();

        if (success && gasForCallExactCheck > 0) {
            require(gasUsed <= gasLimit, "Gas limit exceeded");
        }

        emit MessageReceived(message.messageId, message.sourceChainSelector, message);
        return (success, retBytes, gasUsed);
    }

    function simulateMessageReceived(
        address target,
        Client.Any2EVMMessage memory message
    ) external override whenNotPaused {
        require(target != address(0), "Invalid target address");
        require(_supportedChains[message.sourceChainSelector], "Chain not supported");
        require(validateMessage(message), "Invalid message");
        require(processMessage(), "Rate limit exceeded");

        // Validate target contract exists
        uint256 size;
        assembly {
            size := extcodesize(target)
        }
        require(size > 0, "Target contract does not exist");

        // Create message ID and emit event before simulation
        bytes32 messageId = keccak256(abi.encode(
            block.timestamp,
            target,
            message.sourceChainSelector,
            message.data
        ));
        emit MessageSimulated(target, messageId);

        // Try to execute the message
        (bool success, bytes memory result) = target.call{gas: gasleft() - 2000}(message.data);
        if (!success) {
            if (result.length > 0) {
                assembly {
                    revert(add(32, result), mload(result))
                }
            }
            revert("Message simulation failed");
        }
    }

    // First ccipSend implementation removed as it was duplicated and contained errors

    function ccipSend(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) external payable override returns (bytes32) {
        require(_supportedChains[destinationChainSelector], "Chain not supported");
        require(msg.value >= getFee(destinationChainSelector, message), "Insufficient fee");

        bytes32 messageId = keccak256(abi.encode(
            block.timestamp,
            msg.sender,
            destinationChainSelector,
            message
        ));

        emit MessageSent(messageId, destinationChainSelector, message);
        return messageId;
    }

    function ccipReceive(
        Client.Any2EVMMessage memory message
    ) external whenNotPaused {
        require(_supportedChains[message.sourceChainSelector], "Chain not supported");
        require(validateMessage(message), "Invalid message");
        emit MessageReceived(message.messageId, message.sourceChainSelector, message);
    }

    receive() external payable override {}
}
