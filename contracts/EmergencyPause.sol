// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract EmergencyPause is Ownable {
    uint256 private _pauseThreshold;
    uint256 private _pauseDuration;
    uint256 public lastPauseTime;
    bool private _paused;

    event EmergencyPaused(uint256 amount, uint256 timestamp);
    event EmergencyUnpaused(uint256 timestamp);
    event ThresholdExceeded(uint256 amount, uint256 threshold);
    event PauseThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event PauseDurationUpdated(uint256 oldDuration, uint256 newDuration);

    constructor(uint256 initialPauseThreshold, uint256 initialPauseDuration) {
        require(initialPauseThreshold > 0, "Pause threshold must be positive");
        require(initialPauseDuration > 0, "Pause duration must be positive");
        _pauseThreshold = initialPauseThreshold;
        _pauseDuration = initialPauseDuration;
    }

    function pauseThreshold() public view returns (uint256) {
        return _pauseThreshold;
    }

    function pauseDuration() public view returns (uint256) {
        return _pauseDuration;
    }

    function setPauseThreshold(uint256 newThreshold) public onlyOwner {
        require(newThreshold > 0, "Pause threshold must be positive");
        uint256 oldThreshold = _pauseThreshold;
        _pauseThreshold = newThreshold;
        emit PauseThresholdUpdated(oldThreshold, newThreshold);
    }

    function setPauseDuration(uint256 newDuration) public onlyOwner {
        require(newDuration > 0, "Pause duration must be positive");
        uint256 oldDuration = _pauseDuration;
        _pauseDuration = newDuration;
        emit PauseDurationUpdated(oldDuration, newDuration);
    }

    function checkAndPause(uint256 amount) public {
        if (amount >= _pauseThreshold) {
            _paused = true;
            lastPauseTime = block.timestamp;
            emit EmergencyPaused(amount, block.timestamp);
            emit ThresholdExceeded(amount, _pauseThreshold);
        } else if (_paused && block.timestamp >= lastPauseTime + _pauseDuration) {
            _paused = false;
            emit EmergencyUnpaused(block.timestamp);
        }
    }

    function isPaused() public view returns (bool) {
        if (_paused && block.timestamp >= lastPauseTime + _pauseDuration) {
            return false;
        }
        return _paused;
    }

    function timeUntilUnpause() public view returns (uint256) {
        if (!_paused || block.timestamp >= lastPauseTime + _pauseDuration) {
            return 0;
        }
        return (lastPauseTime + _pauseDuration) - block.timestamp;
    }
}
