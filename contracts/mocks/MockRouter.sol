// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IAny2EVMMessageReceiver.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";

contract MockRouter is IRouterClient {
    event MessageSent(
        uint64 destinationChainSelector,
        bytes message
    );

    function ccipSend(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) external payable override returns (bytes32) {
        require(destinationChainSelector != 0, "Invalid chain selector");

        bytes memory encodedMessage = abi.encode(
            message.receiver,
            message.data,
            message.tokenAmounts,
            message.extraArgs,
            message.feeToken
        );

        emit MessageSent(
            destinationChainSelector,
            encodedMessage
        );

        return keccak256(encodedMessage);
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

        return this.ccipSend(137, message);
    }

    function getFee(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) external pure override returns (uint256) {
        require(destinationChainSelector == 137, "Unsupported chain");
        return 0.1 ether;
    }

    function isChainSupported(uint64 chainSelector) external pure override returns (bool) {
        return chainSelector == 137;
    }

    function getSupportedTokens(uint64 chainSelector) external pure override returns (address[] memory) {
        require(chainSelector == 137, "Unsupported chain");
        address[] memory tokens = new address[](0);
        return tokens;
    }

    function simulateMessageReceived(
        address target,
        Client.Any2EVMMessage memory message
    ) external {
        require(message.sourceChainSelector == 138, "Invalid source chain");
        require(target != address(0), "Invalid target address");

        // Ensure the message format matches what CrossChainMessenger expects
        IAny2EVMMessageReceiver(target).ccipReceive(
            Client.Any2EVMMessage({
                messageId: message.messageId,
                sourceChainSelector: message.sourceChainSelector,
                sender: message.sender,
                data: message.data,
                destTokenAmounts: message.destTokenAmounts
            })
        );
    }

    function ccipReceive(Client.Any2EVMMessage memory message) external {
        IAny2EVMMessageReceiver(msg.sender).ccipReceive(message);
    }

    receive() external payable {}
}
