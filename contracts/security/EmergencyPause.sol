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
        require(_pauseThreshold > 0, "EmergencyPause: threshold must be positive");
        require(_pauseDuration > 0, "EmergencyPause: duration must be positive");
        pauseThreshold = _pauseThreshold;
        pauseDuration = _pauseDuration;
        _transferOwnership(msg.sender);
    }

    function setPauseThreshold(uint256 _pauseThreshold) external onlyOwner {
        require(_pauseThreshold > 0, "EmergencyPause: threshold must be positive");
        uint256 oldThreshold = pauseThreshold;
        pauseThreshold = _pauseThreshold;
        emit PauseThresholdUpdated(oldThreshold, _pauseThreshold);
    }

    function setPauseDuration(uint256 _pauseDuration) external onlyOwner {
        require(_pauseDuration > 0, "EmergencyPause: duration must be positive");
        uint256 oldDuration = pauseDuration;
        pauseDuration = _pauseDuration;
        emit PauseDurationUpdated(oldDuration, _pauseDuration);
    }

    function checkAndPause(uint256 amount) public returns (bool) {
        if (amount >= pauseThreshold) {
            _pause();
            lastPauseTimestamp = block.timestamp;
            emit EmergencyPauseTriggered(lastPauseTimestamp, pauseDuration);
            return true;
        }
        return false;
    }

    function checkAndUnpause() public {
        if (paused() && block.timestamp >= lastPauseTimestamp + pauseDuration) {
            uint256 timestamp = block.timestamp;
            _unpause();
            emit EmergencyUnpauseTriggered(timestamp);
            totalValueLocked = 0;
        }
    }

    function checkAndUpdateValue(uint256 amount) external returns (bool) {
        checkAndUnpause();
        require(!paused(), "Pausable: paused");
        totalValueLocked += amount;
        emit ValueLocked(amount);
        return checkAndPause(amount);
    }

    function lockValue(uint256 amount) external {
        checkAndUnpause();
        require(!paused(), "Pausable: paused");
        totalValueLocked += amount;
        emit ValueLocked(amount);
        checkAndPause(amount);
    }

    function unlockValue(uint256 amount) external {
        checkAndUnpause();
        require(!paused(), "Pausable: paused");
        require(amount <= totalValueLocked, "EmergencyPause: amount exceeds locked value");
        totalValueLocked -= amount;
        emit ValueUnlocked(amount);
    }

    function emergencyUnpause() external onlyOwner {
        require(paused(), "EmergencyPause: contract not paused");
        uint256 timestamp = block.timestamp;
        _unpause();
        emit EmergencyUnpauseTriggered(timestamp);
        totalValueLocked = 0;
    }

    function getRemainingPauseDuration() external view returns (uint256) {
        if (!paused()) return 0;
        uint256 elapsedTime = block.timestamp - lastPauseTimestamp;
        if (elapsedTime >= pauseDuration) return 0;
        return pauseDuration - elapsedTime;
    }
}
