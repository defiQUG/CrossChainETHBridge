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

    // Allow contract to receive ETH
    receive() external payable {}
    fallback() external payable {}

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
        require(message.receiver.length > 0, "Invalid receiver");
        require(destinationChainSelector == 137 || destinationChainSelector == 138, "Unsupported chain");

        processingMessage = true;

        bytes32 messageId = nextMessageId == bytes32(0)
            ? keccak256(abi.encode(destinationChainSelector, message.receiver, message.data))
            : nextMessageId;

        address target = address(bytes20(message.receiver));
        require(target != address(0), "Invalid target address");

        // Emit message sent event
        emit MessageSent(
            messageId,
            destinationChainSelector,
            target,
            message.data,
            address(0),
            msg.value
        );

        // For testing reentrancy, simulate message to Polygon first
        if (destinationChainSelector == 137) {
            // Only validate contract requirement for non-test addresses
            bool isTestAddress = target == address(0x1) || target == address(0x2);
            if (!isTestAddress) {
                require(target.code.length > 0, "Target must be a contract");
            }

            // Handle message data validation
            if (message.data.length >= 64) {
                // Decode both receiver and amount from message data
                (address receiver, uint256 transferAmount) = abi.decode(message.data, (address, uint256));
                require(receiver == target, "Receiver mismatch");
                require(msg.value >= transferAmount + mockFee, "Insufficient ETH value");

                // Store fee before simulation
                uint256 fee = mockFee;

                // Simulate CCIP message if target is a contract
                if (target.code.length > 0) {
                    bytes32 simulatedMessageId = keccak256(abi.encode(destinationChainSelector, target, message.data));
                    try IAny2EVMMessageReceiver(target).ccipReceive(
                        Client.Any2EVMMessage({
                            messageId: simulatedMessageId,
                            sourceChainSelector: destinationChainSelector,
                            sender: abi.encode(msg.sender),
                            data: message.data,
                            destTokenAmounts: new Client.EVMTokenAmount[](0)
                        })
                    ) {} catch Error(string memory reason) {
                        revert(string.concat("CCIP receive failed: ", reason));
                    }
                }

                // Then handle ETH transfer
                (bool success,) = payable(target).call{value: transferAmount}("");
                require(success, "ETH transfer failed");

                // Return excess ETH after fee
                uint256 excess = msg.value - (transferAmount + fee);
                if (excess > 0) {
                    (bool refundSuccess,) = payable(msg.sender).call{value: excess}("");
                    require(refundSuccess, "Refund failed");
                }
            }
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

        // Skip contract validation for test addresses
        bool isTestAddress = target == address(0x1) || target == address(0x2);
        if (!isTestAddress && target.code.length == 0) {
            revert("Target must be a contract");
        }

        Client.EVMTokenAmount[] memory destTokenAmounts = new Client.EVMTokenAmount[](0);
        bytes32 messageId = keccak256(abi.encode(sourceChainSelector, sender, data));

        // Only attempt ccipReceive if target is a contract
        if (target.code.length > 0) {
            IAny2EVMMessageReceiver(target).ccipReceive(
                Client.Any2EVMMessage({
                    messageId: messageId,
                    sourceChainSelector: sourceChainSelector,
                    sender: abi.encode(sender),
                    data: data,
                    destTokenAmounts: destTokenAmounts
                })
            );
        }

        processingMessage = false;
    }
}
