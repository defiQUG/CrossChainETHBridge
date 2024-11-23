// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

abstract contract SecurityBase is Ownable, Pausable {
    event SecurityPaused(address indexed triggeredBy, uint256 timestamp);
    event SecurityUnpaused(address indexed triggeredBy, uint256 timestamp);

    function emergencyPause() external virtual onlyOwner {
        _pause();
        emit SecurityPaused(msg.sender, block.timestamp);
    }

    function emergencyUnpause() external virtual onlyOwner {
        _unpause();
        emit SecurityUnpaused(msg.sender, block.timestamp);
    }
}
