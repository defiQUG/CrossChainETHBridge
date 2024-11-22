// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IAny2EVMMessageReceiver.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";

contract MockRouter is IRouterClient {
    event MessageSent(
        uint64 destinationChainSelector,
        address receiver,
        uint256 amount
    );

    function ccipSend(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) external payable returns (bytes32) {
        require(destinationChainSelector == 137, "Invalid chain selector");

        address receiver = address(bytes20(message.receiver));
        uint256 amount = abi.decode(message.data, (uint256));

        emit MessageSent(
            destinationChainSelector,
            receiver,
            amount
        );

        return keccak256(abi.encodePacked(block.timestamp, msg.sender, receiver, amount));
    }

    function sendMessage(
        address receiver,
        uint256 amount
    ) external payable returns (bytes32) {
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: abi.encode(amount),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: "",
            feeToken: address(0)
        });

        return ccipSend(137, message);
    }

    function getFee(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) external pure returns (uint256 fee) {
        return 0.1 ether;
    }

    function isChainSupported(uint64 chainSelector) external pure returns (bool supported) {
        return chainSelector == 137;
    }

    function getSupportedTokens(uint64 chainSelector) external pure returns (address[] memory tokens) {
        tokens = new address[](0);
        return tokens;
    }

    function simulateMessageReceived(
        address target,
        bytes32 messageId,
        address sender,
        uint256 amount
    ) external {
        Client.EVMTokenAmount[] memory destTokenAmounts = new Client.EVMTokenAmount[](0);
        bytes memory data = abi.encode(amount);
        bytes memory encodedSender = abi.encodePacked(sender);

        Client.Any2EVMMessage memory message = Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: 138, // Defi Oracle Meta Mainnet
            sender: encodedSender,
            data: data,
            destTokenAmounts: destTokenAmounts
        });

        IAny2EVMMessageReceiver(target).ccipReceive(message);
    }

    function ccipReceive(Client.Any2EVMMessage memory message) external {
        IAny2EVMMessageReceiver(msg.sender).ccipReceive(message);
    }

    receive() external payable {}
}
