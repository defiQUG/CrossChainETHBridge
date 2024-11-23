// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract EmergencyPause is Ownable, Pausable {
    uint256 public pauseThreshold;
    uint256 public pauseDuration;
    uint256 public lastPauseTimestamp;
    uint256 public totalValueLocked;

    event PauseThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event PauseDurationUpdated(uint256 oldDuration, uint256 newDuration);
    event ValueLocked(uint256 amount);
    event ValueUnlocked(uint256 amount);
    event EmergencyPauseTriggered(uint256 timestamp, uint256 duration);
    event EmergencyUnpauseTriggered(uint256 timestamp);

    constructor(uint256 _pauseThreshold, uint256 _pauseDuration) {
        require(_pauseThreshold > 0, "Pause threshold must be positive");
        require(_pauseDuration > 0, "Pause duration must be positive");
        pauseThreshold = _pauseThreshold;
        pauseDuration = _pauseDuration;
    }

    modifier checkPauseExpiry() {
        if (paused() && block.timestamp >= lastPauseTimestamp + pauseDuration) {
            _unpause();
            emit EmergencyUnpauseTriggered(block.timestamp);
        }
        _;
    }

    function setPauseThreshold(uint256 _pauseThreshold) external onlyOwner {
        require(_pauseThreshold > 0, "Pause threshold must be positive");
        uint256 oldThreshold = pauseThreshold;
        pauseThreshold = _pauseThreshold;
        emit PauseThresholdUpdated(oldThreshold, _pauseThreshold);
    }

    function setPauseDuration(uint256 _pauseDuration) external onlyOwner {
        require(_pauseDuration > 0, "Pause duration must be positive");
        uint256 oldDuration = pauseDuration;
        pauseDuration = _pauseDuration;
        emit PauseDurationUpdated(oldDuration, _pauseDuration);
    }

    function lockValue(uint256 amount) external checkPauseExpiry {
        require(!paused(), "Contract is paused");
        totalValueLocked += amount;
        if (totalValueLocked >= pauseThreshold) {
            lastPauseTimestamp = block.timestamp;
            _pause();
            emit EmergencyPauseTriggered(block.timestamp, pauseDuration);
        }
        emit ValueLocked(amount);
    }

    function unlockValue(uint256 amount) external checkPauseExpiry {
        require(!paused(), "Contract is paused");
        require(amount <= totalValueLocked, "Amount exceeds locked value");
        totalValueLocked -= amount;
        emit ValueUnlocked(amount);
    }

    function emergencyUnpause() external onlyOwner {
        require(paused(), "Contract not paused");
        _unpause();
        emit EmergencyUnpauseTriggered(block.timestamp);
    }

    function getRemainingPauseDuration() external view returns (uint256) {
        if (!paused()) return 0;
        uint256 endTime = lastPauseTimestamp + pauseDuration;
        if (block.timestamp >= endTime) return 0;
        return endTime - block.timestamp;
    }
}