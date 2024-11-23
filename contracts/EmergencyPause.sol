// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract EmergencyPause is Ownable, Pausable {
    uint256 public pauseThreshold;
    uint256 public pauseDuration;
    uint256 public lastPauseTimestamp;
    uint256 public totalValueLocked;

    event EmergencyPauseTriggered(string reason, uint256 duration);
    event ThresholdUpdated(uint256 newThreshold);
    event DurationUpdated(uint256 newDuration);

    constructor(uint256 _pauseThreshold, uint256 _pauseDuration) {
        require(_pauseThreshold > 0, "Threshold must be positive");
        require(_pauseDuration > 0, "Duration must be positive");
        pauseThreshold = _pauseThreshold;
        pauseDuration = _pauseDuration;
    }

    function setPauseThreshold(uint256 _threshold) external onlyOwner {
        require(_threshold > 0, "Threshold must be positive");
        pauseThreshold = _threshold;
        emit ThresholdUpdated(_threshold);
    }

    function setPauseDuration(uint256 _duration) external onlyOwner {
        require(_duration > 0, "Duration must be positive");
        pauseDuration = _duration;
        emit DurationUpdated(_duration);
    }

    function emergencyPause(string memory reason) external onlyOwner {
        _pause();
        lastPauseTimestamp = block.timestamp;
        emit EmergencyPauseTriggered(reason, pauseDuration);
    }

    function checkAndUpdateValue(uint256 value) external returns (bool) {
        totalValueLocked += value;
        if (totalValueLocked >= pauseThreshold) {
            if (!paused()) {
                _pause();
                lastPauseTimestamp = block.timestamp;
                emit EmergencyPauseTriggered("Threshold exceeded", pauseDuration);
            }
            return false;
        }
        return true;
    }

    function unpauseIfDurationPassed() external {
        require(paused(), "Contract not paused");
        require(
            block.timestamp >= lastPauseTimestamp + pauseDuration,
            "Pause duration not elapsed"
        );
        _unpause();
        totalValueLocked = 0;
    }

    function isPauseActive() external view returns (bool) {
        if (!paused()) return false;
        return block.timestamp < lastPauseTimestamp + pauseDuration;
    }

    function getTimeUntilUnpause() external view returns (uint256) {
        if (!paused()) return 0;
        uint256 endTime = lastPauseTimestamp + pauseDuration;
        if (block.timestamp >= endTime) return 0;
        return endTime - block.timestamp;
    }
}
