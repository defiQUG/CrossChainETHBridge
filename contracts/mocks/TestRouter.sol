// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MockRouter.sol";
import "../security/SecurityBase.sol";

contract TestRouter is MockRouter, SecurityBase {
    mapping(uint64 => bool) public supportedChains;

    constructor() {
        supportedChains[137] = true; // Polygon
        supportedChains[138] = true; // Defi Oracle Meta
    }

    function isChainSupported(uint64 chainSelector) public view override returns (bool) {
        return supportedChains[chainSelector];
    }

    function validateMessage(Client.Any2EVMMessage memory message) internal pure returns (bool) {
        return message.messageId != bytes32(0);
    }

    function getFee(uint64 destinationChainSelector, Client.EVM2AnyMessage memory message)
        public
        pure
        override
        returns (uint256)
    {
        return 0.01 ether;
    }

    function routeMessage(
        Client.Any2EVMMessage memory message
    ) external override whenNotPaused returns (bool) {
        require(isChainSupported(message.sourceChainSelector), "Chain not supported");
        require(validateMessage(message), "Invalid message");
        return processMessage();
    }

    function ccipSend(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) external payable override whenNotPaused returns (bytes32) {
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
    ) external override whenNotPaused {
        require(isChainSupported(message.sourceChainSelector), "Chain not supported");
        require(validateMessage(message), "Invalid message");
        emit MessageReceived(message.messageId, message.sourceChainSelector, message);
    }
}
