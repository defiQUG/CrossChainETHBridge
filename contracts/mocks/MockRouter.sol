// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

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

    uint256 private mockFee = 0.001 ether;
    bytes32 private nextMessageId;
    bool private processingMessage;

    function setFee(uint256 _fee) external {
        mockFee = _fee;
    }

    function setNextMessageId(bytes32 _messageId) external {
        nextMessageId = _messageId;
    }

    function ccipSend(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) external payable returns (bytes32) {
        require(!processingMessage, "Reentrant call detected");
        processingMessage = true;

        bytes32 messageId = nextMessageId == bytes32(0)
            ? keccak256(abi.encode(destinationChainSelector, message.receiver, message.data))
            : nextMessageId;

        // Emit message sent event
        emit MessageSent(
            messageId,
            destinationChainSelector,
            address(bytes20(message.receiver)),
            message.data,
            address(0),
            msg.value
        );

        // For testing reentrancy, directly call the target if sending to Polygon
        if (destinationChainSelector == 137) {
            address target = address(bytes20(message.receiver));
            // Decode both receiver and amount from message data
            (address receiver, uint256 transferAmount) = abi.decode(message.data, (address, uint256));
            require(receiver == target, "Receiver mismatch");

            // Direct call while maintaining reentrancy lock
            (bool success,) = target.call{value: transferAmount}("");
            require(success, "Direct call failed");
        }

        // Reset processing flag after all operations are complete
        processingMessage = false;

        return messageId;
    }

    function getFee(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) external view returns (uint256 fee) {
        require(destinationChainSelector > 0, "Invalid chain selector");
        require(message.receiver.length > 0, "Invalid receiver");
        return mockFee;
    }

    function isChainSupported(uint64 chainSelector) external pure returns (bool supported) {
        return chainSelector == 137 || chainSelector == 138;  // Only Polygon and Defi Oracle Meta
    }

    function getSupportedTokens(uint64 chainSelector) external pure returns (address[] memory tokens) {
        require(chainSelector == 137 || chainSelector == 138, "Unsupported chain");
        tokens = new address[](0);
        return tokens;
    }

    function simulateMessageReceived(
        address target,
        uint64 sourceChainSelector,
        address sender,
        bytes memory data
    ) external {
        require(!processingMessage, "Reentrant call detected");
        processingMessage = true;

        Client.EVMTokenAmount[] memory destTokenAmounts = new Client.EVMTokenAmount[](0);
        bytes32 messageId = keccak256(abi.encode(sourceChainSelector, sender, data));

        IAny2EVMMessageReceiver(target).ccipReceive(
            Client.Any2EVMMessage({
                messageId: messageId,
                sourceChainSelector: sourceChainSelector,
                sender: abi.encode(sender),
                data: data,
                destTokenAmounts: destTokenAmounts
            })
        );

        processingMessage = false;
    }
}
