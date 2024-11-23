// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract EmergencyPause is Ownable, Pausable {
    event EmergencyPaused(address account);
    event EmergencyUnpaused(address account);

    constructor() {}

    function pause() external onlyOwner {
        _pause();
        emit EmergencyPaused(msg.sender);
    }

    function unpause() external onlyOwner {
        _unpause();
        emit EmergencyUnpaused(msg.sender);
    }

    function isPaused() external view returns (bool) {
        return paused();
    }
}
