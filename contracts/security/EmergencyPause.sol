// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract EmergencyPause is Ownable, Pausable {
    uint256 public pauseThreshold;
    uint256 public pauseDuration;
    uint256 public lastPauseTimestamp;
    uint256 public lockedValue;

    event PauseThresholdUpdated(uint256 newThreshold);
    event PauseDurationUpdated(uint256 newDuration);
    event ValueLocked(uint256 amount);
    event ValueUnlocked(uint256 amount);

    constructor(uint256 _pauseThreshold, uint256 _pauseDuration) {
        require(_pauseThreshold > 0, "Pause threshold must be greater than 0");
        require(_pauseDuration > 0, "Pause duration must be greater than 0");
        pauseThreshold = _pauseThreshold;
        pauseDuration = _pauseDuration;
        _transferOwnership(msg.sender);
    }

    function setPauseThreshold(uint256 _pauseThreshold) external onlyOwner {
        require(_pauseThreshold > 0, "Pause threshold must be greater than 0");
        pauseThreshold = _pauseThreshold;
        emit PauseThresholdUpdated(_pauseThreshold);
    }

    function setPauseDuration(uint256 _pauseDuration) external onlyOwner {
        require(_pauseDuration > 0, "Pause duration must be greater than 0");
        pauseDuration = _pauseDuration;
        emit PauseDurationUpdated(_pauseDuration);
    }

    function checkAndPause(uint256 amount) external {
        if (amount >= pauseThreshold) {
            _pause();
            lastPauseTimestamp = block.timestamp;
            lockedValue += amount;
            emit ValueLocked(amount);
        }
    }

    function unpauseIfDurationElapsed() external {
        require(paused(), "Contract is not paused");
        require(
            block.timestamp >= lastPauseTimestamp + pauseDuration,
            "Pause duration not elapsed"
        );
        _unpause();
        emit ValueUnlocked(lockedValue);
        lockedValue = 0;
    }

    function emergencyUnpause() external onlyOwner {
        require(paused(), "Contract is not paused");
        _unpause();
        emit ValueUnlocked(lockedValue);
        lockedValue = 0;
    }

    function getLockedValue() external view returns (uint256) {
        return lockedValue;
    }

    function getRemainingPauseDuration() external view returns (uint256) {
        if (!paused()) return 0;
        uint256 elapsedTime = block.timestamp - lastPauseTimestamp;
        if (elapsedTime >= pauseDuration) return 0;
        return pauseDuration - elapsedTime;
    }
}
