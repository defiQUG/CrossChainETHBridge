// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

abstract contract SecurityBase is Ownable, Pausable {
    uint256 public messageCount;

    event SecurityPaused(address indexed triggeredBy, uint256 timestamp);
    event SecurityUnpaused(address indexed triggeredBy, uint256 timestamp);
    event MessageProcessed(address indexed sender, uint256 timestamp);

    function emergencyPause() external virtual onlyOwner {
        _pause();
        emit SecurityPaused(msg.sender, block.timestamp);
    }

    function emergencyUnpause() external virtual onlyOwner {
        _unpause();
        emit SecurityUnpaused(msg.sender, block.timestamp);
    }

    // Abstract function without modifiers - implementing contracts will add whenNotPaused
    function processMessage() public virtual returns (bool);
}
