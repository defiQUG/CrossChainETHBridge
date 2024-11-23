// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract EmergencyPause {
    bool public paused;
    uint256 public pauseThreshold;
    uint256 public pauseDuration;
    uint256 public lastPauseTime;
    address public admin;

    event Paused(uint256 timestamp);
    event Unpaused(uint256 timestamp);
    event PauseThresholdUpdated(uint256 newThreshold);

    constructor(uint256 _pauseThreshold, uint256 _pauseDuration) {
        pauseThreshold = _pauseThreshold;
        pauseDuration = _pauseDuration;
        admin = msg.sender;
    }

    function checkAndPause(uint256 amount) internal {
        if (amount >= pauseThreshold) {
            paused = true;
            lastPauseTime = block.timestamp;
            emit Paused(block.timestamp);
        }
    }

    function checkPauseStatus() public view returns (bool) {
        if (!paused) return false;
        if (block.timestamp >= lastPauseTime + pauseDuration) {
            return false;
        }
        return true;
    }
}
