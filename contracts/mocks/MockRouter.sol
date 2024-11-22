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
        bytes32 messageId = nextMessageId == bytes32(0)
            ? keccak256(abi.encode(destinationChainSelector, message.receiver, message.data))
            : nextMessageId;

        emit MessageSent(
            messageId,
            destinationChainSelector,
            address(bytes20(message.receiver)),
            message.data,
            address(0),
            msg.value
        );

        return messageId;
    }

    function getFee(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) external view returns (uint256 fee) {
        return mockFee;
    }

    function isChainSupported(uint64 chainSelector) external pure returns (bool supported) {
        return true;
    }

    function getSupportedTokens(uint64 chainSelector) external pure returns (address[] memory tokens) {
        tokens = new address[](0);
        return tokens;
    }

    function simulateMessageReceived(
        address target,
        uint64 sourceChainSelector,
        address sender,
        bytes memory data
    ) external {
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
    }
}
