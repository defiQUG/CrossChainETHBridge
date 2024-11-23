// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MockRouter.sol";

contract TestRouter is MockRouter {
    function routeMessage(
        Client.Any2EVMMessage memory message
    ) external override returns (bool) {
        require(isChainSupported(message.sourceChainSelector), "Chain not supported");
        require(validateMessage(message), "Invalid message");
        return true;
    }

    function ccipSend(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) external payable override returns (bytes32) {
        require(isChainSupported(destinationChainSelector), "Chain not supported");
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
    ) external override {
        require(isChainSupported(message.sourceChainSelector), "Chain not supported");
        require(validateMessage(message), "Invalid message");
        emit MessageReceived(message.messageId, message.sourceChainSelector, message);
    }

    function processMessage() public override returns (bool) {
        checkAndUpdateRateLimit();
        return true;
    }
}
