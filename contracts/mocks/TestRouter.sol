// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MockRouter.sol";

contract TestRouter is MockRouter {
    constructor() {
        _supportedChains[137] = true; // Polygon
        _supportedChains[138] = true; // Defi Oracle Meta
    }

    function validateMessage(Client.Any2EVMMessage memory message) public pure override returns (bool) {
        return message.messageId != bytes32(0) && super.validateMessage(message);
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
        require(validateMessage(message), "Message validation failed");
        require(processMessage(), "Rate limit exceeded");

        bytes32 messageId = keccak256(abi.encode(message));
        emit MessageSimulated(target, messageId);

        (bool success, ) = target.call(message.data);
        require(success, "Message simulation failed");
    }

    function processMessage() public override returns (bool) {
        return super.processMessage();
    }

    receive() external payable override {}
}

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

    function processMessage() public override returns (bool) {
        super.processMessage();
        return true;
    }

    receive() external payable override {}
}
