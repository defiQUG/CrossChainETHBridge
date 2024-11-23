// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MockRouter.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";

// Chain selectors for supported networks
uint64 constant DEFI_ORACLE_META_CHAIN_SELECTOR = 138;
uint64 constant POLYGON_CHAIN_SELECTOR = 137;

contract TestRouter is MockRouter, IRouterClient {
    constructor() {
        // Chains will be initialized through separate function calls
        // to match test expectations
    }

    function isChainSupported(uint64 destChainSelector) external view override returns (bool) {
        return _supportedChains[destChainSelector];
    }

    function getSupportedTokens(uint64 chainSelector) external view returns (address[] memory) {
        require(_supportedChains[chainSelector], "Unsupported chain");
        return new address[](0); // Return empty array for valid chains as per test expectations
    }

    function getFee(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) public view override(MockRouter, IRouterClient) returns (uint256) {
        require(_supportedChains[destinationChainSelector], "Unsupported chain");
        return 100000000000000000; // 0.1 ETH in wei as specified in tests
    }

    function validateMessage(Client.Any2EVMMessage memory message) public pure override returns (bool) {
        require(message.messageId != bytes32(0), "Invalid message ID");
        require(message.sourceChainSelector != 0, "Invalid chain selector");
        require(message.sender.length == 20, "Invalid sender length");
        require(message.data.length > 0, "Empty message data");
        (address receiver,) = abi.decode(message.data, (address, uint256));
        require(receiver != address(0), "Invalid recipient");
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
        require(_supportedChains[message.sourceChainSelector], "Invalid source chain");

        // Create a new message with the target address
        Client.Any2EVMMessage memory simulatedMessage = Client.Any2EVMMessage({
            messageId: message.messageId,
            sourceChainSelector: message.sourceChainSelector,
            sender: message.sender,
            data: message.data,
            tokenAmounts: message.tokenAmounts,
            destTokenAmounts: message.destTokenAmounts,
            extraArgs: message.extraArgs
        });

        require(validateMessage(simulatedMessage), "Message validation failed");
        require(processMessage(), "Rate limit exceeded");

        bytes32 messageId = keccak256(abi.encode(
            block.timestamp,
            target,
            simulatedMessage.sourceChainSelector,
            simulatedMessage.data
        ));
        emit MessageSimulated(target, messageId);

        (bool success, ) = target.call(simulatedMessage.data);
        require(success, "Message simulation failed");
    }

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
