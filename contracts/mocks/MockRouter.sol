// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IAny2EVMMessageReceiver.sol";

contract MockRouter is IRouterClient {
    event MessageSent(
        bytes32 messageId,
        uint64 destinationChainSelector,
        address receiver,
        bytes message,
        address feeToken,
        uint256 fees
    );

    function ccipSend(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) external payable returns (bytes32) {
        bytes32 messageId = keccak256(
            abi.encode(
                destinationChainSelector,
                message.receiver,
                message.data
            )
        );

        emit MessageSent(
            messageId,
            destinationChainSelector,
            address(bytes20(message.receiver)), // Fix: Convert bytes to address
            message.data,
            address(0),
            msg.value
        );

        return messageId;
    }

    function getFee(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) external pure returns (uint256 fee) {
        return 0.1 ether;
    }

    function isChainSupported(uint64 chainSelector) external pure returns (bool supported) {
        return true;
    }

    // Implement missing interface function
    function getSupportedTokens(uint64 chainSelector) external pure returns (address[] memory tokens) {
        tokens = new address[](0);
        return tokens;
    }

    // Helper function to simulate receiving messages
    function simulateMessageReceived(
        address target,
        bytes32 messageId,
        address sender,
        bytes memory data
    ) external {
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](0);

        IAny2EVMMessageReceiver(target).ccipReceive(
            Client.Any2EVMMessage({
                messageId: messageId,
                sourceChainSelector: 1,
                sender: abi.encode(sender),
                data: data,
                tokenAmounts: tokenAmounts
            })
        );
    }
}
