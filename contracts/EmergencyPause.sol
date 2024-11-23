// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract EmergencyPause {
    uint256 public immutable pauseThreshold;
    uint256 public immutable pauseDuration;
    uint256 public lastPauseTime;
    bool private _paused;

    event EmergencyPaused(uint256 amount, uint256 timestamp);
    event EmergencyUnpaused(uint256 timestamp);
    event ThresholdExceeded(uint256 amount, uint256 threshold);

    constructor(uint256 _pauseThreshold, uint256 _pauseDuration) {
        require(_pauseThreshold > 0, "Pause threshold must be positive");
        require(_pauseDuration > 0, "Pause duration must be positive");
        pauseThreshold = _pauseThreshold;
        pauseDuration = _pauseDuration;
    }

    function checkAndPause(uint256 amount) public {
        if (amount >= pauseThreshold) {
            _paused = true;
            lastPauseTime = block.timestamp;
            emit EmergencyPaused(amount, block.timestamp);
            emit ThresholdExceeded(amount, pauseThreshold);
        } else if (_paused && block.timestamp >= lastPauseTime + pauseDuration) {
            _paused = false;
            emit EmergencyUnpaused(block.timestamp);
        }
    }

    function isPaused() public view returns (bool) {
        if (_paused && block.timestamp >= lastPauseTime + pauseDuration) {
            return false;
        }
        return _paused;
    }

    function timeUntilUnpause() public view returns (uint256) {
        if (!_paused || block.timestamp >= lastPauseTime + pauseDuration) {
            return 0;
        }
        return (lastPauseTime + pauseDuration) - block.timestamp;
    }
}
