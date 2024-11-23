// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

abstract contract SecurityBase is Ownable, Pausable {
    uint256 public messageCount;
    mapping(bytes32 => bool) public processedMessages;

    event SecurityPaused(address indexed triggeredBy, uint256 timestamp);
    event SecurityUnpaused(address indexed triggeredBy, uint256 timestamp);
    event MessageProcessed(address indexed sender, bytes32 indexed messageId, uint256 timestamp);

    error MessageAlreadyProcessed(bytes32 messageId);
    error InvalidMessageData();

    constructor() Ownable() Pausable() {
        _transferOwnership(msg.sender);
        messageCount = 0;
    }

    function emergencyPause() external virtual onlyOwner {
        _pause();
        emit SecurityPaused(msg.sender, block.timestamp);
    }

    function emergencyUnpause() external virtual onlyOwner {
        _unpause();
        emit SecurityUnpaused(msg.sender, block.timestamp);
    }

    function _processMessage(bytes32 messageId, bytes memory data) internal virtual whenNotPaused returns (bool) {
        if (processedMessages[messageId]) revert MessageAlreadyProcessed(messageId);
        if (data.length == 0) revert InvalidMessageData();

        processedMessages[messageId] = true;
        messageCount++;
        emit MessageProcessed(msg.sender, messageId, block.timestamp);
        return true;
    }

    // Abstract function that must be implemented by child contracts
    function processMessage() public virtual returns (bool);
}
