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

    function getFee(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) external pure returns (uint256 fee) {
        return 0.1 ether;
    }

    function isChainSupported(uint64 chainSelector) external pure returns (bool supported) {
        return chainSelector == 137;
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
        uint256 amount
    ) external {
        // Properly encode the sender address as bytes
        bytes memory encodedSender = abi.encodePacked(sender);

        // Create token amounts array (empty for ETH transfers)
        Client.EVMTokenAmount[] memory destTokenAmounts = new Client.EVMTokenAmount[](0);

        // Encode amount as bytes
        bytes memory data = abi.encode(amount);

        IAny2EVMMessageReceiver(target).ccipReceive(
            Client.Any2EVMMessage({
                messageId: messageId,
                sourceChainSelector: 138, // Defi Oracle Meta Mainnet
                sender: encodedSender,
                data: data,
                destTokenAmounts: destTokenAmounts
            })
        );
    }

    // Add sendMessage function for testing
    function sendMessage(
        address target,
        Client.Any2EVMMessage memory message
    ) external {
        IAny2EVMMessageReceiver(target).ccipReceive(message);
    }

    receive() external payable {}
}
