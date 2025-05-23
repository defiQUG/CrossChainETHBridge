// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "../errors/EmergencyPauseErrors.sol";
import "../interfaces/IEmergencyPause.sol";

contract EmergencyPause is IEmergencyPause, Ownable, Pausable {
    uint256 public pauseThreshold;
    uint256 public pauseDuration;
    uint256 public lastPauseTimestamp;
    uint256 public totalValueLocked;

    constructor(uint256 _pauseThreshold, uint256 _pauseDuration) {
        if (_pauseThreshold == 0)
            revert EmergencyPauseErrors.InvalidPauseThreshold();
        if (_pauseDuration == 0)
            revert EmergencyPauseErrors.InvalidPauseDuration();
        pauseThreshold = _pauseThreshold;
        pauseDuration = _pauseDuration;
        _transferOwnership(msg.sender);
    }

    function setPauseThreshold(
        uint256 _pauseThreshold
    ) external override onlyOwner {
        if (_pauseThreshold == 0)
            revert EmergencyPauseErrors.InvalidPauseThreshold();
        uint256 oldThreshold = pauseThreshold;
        pauseThreshold = _pauseThreshold;
        emit PauseThresholdUpdated(oldThreshold, _pauseThreshold);
    }

    function setPauseDuration(
        uint256 _pauseDuration
    ) external override onlyOwner {
        if (_pauseDuration == 0)
            revert EmergencyPauseErrors.InvalidPauseDuration();
        uint256 oldDuration = pauseDuration;
        pauseDuration = _pauseDuration;
        emit PauseDurationUpdated(oldDuration, _pauseDuration);
    }

    function checkAndPause(uint256 amount) public override returns (bool) {
        uint256 newTotal = totalValueLocked + amount;
        if (newTotal >= pauseThreshold) {
            _pause();
            lastPauseTimestamp = block.timestamp;
            emit EmergencyPauseTriggered(lastPauseTimestamp, pauseDuration);
            return true;
        }
        return false;
    }

    function checkAndUnpause() public override {
        if (paused() && block.timestamp >= lastPauseTimestamp + pauseDuration) {
            uint256 timestamp = block.timestamp;
            _unpause();
            emit EmergencyUnpauseTriggered(timestamp);
            totalValueLocked = 0;
        }
    }

    function checkAndUpdateValue(
        uint256 amount
    ) external override returns (bool) {
        checkAndUnpause();
        if (paused()) revert EmergencyPauseErrors.ContractPaused();
        bool shouldPause = (totalValueLocked + amount) >= pauseThreshold;
        if (shouldPause) {
            _pause();
            lastPauseTimestamp = block.timestamp;
            emit EmergencyPauseTriggered(lastPauseTimestamp, pauseDuration);
        }
        totalValueLocked += amount;
        emit ValueLocked(amount);
        return shouldPause;
    }

    function lockValue(uint256 amount) external override {
        checkAndUnpause();
        if (paused()) revert EmergencyPauseErrors.ContractPaused();
        uint256 newTotal = totalValueLocked + amount;
        if (newTotal >= pauseThreshold) {
            _pause();
            lastPauseTimestamp = block.timestamp;
            emit EmergencyPauseTriggered(lastPauseTimestamp, pauseDuration);
        }
        totalValueLocked = newTotal;
        emit ValueLocked(amount);
    }

    function unlockValue(uint256 amount) external override {
        checkAndUnpause();
        if (paused()) revert EmergencyPauseErrors.ContractPaused();
        if (amount > totalValueLocked)
            revert EmergencyPauseErrors.AmountExceedsLockedValue();
        totalValueLocked -= amount;
        emit ValueUnlocked(amount);
    }

    function emergencyUnpause() external override onlyOwner {
        if (!paused()) revert EmergencyPauseErrors.ContractNotPaused();
        uint256 timestamp = block.timestamp;
        _unpause();
        emit EmergencyUnpauseTriggered(timestamp);
        totalValueLocked = 0;
    }

    function getRemainingPauseDuration()
        external
        view
        override
        returns (uint256)
    {
        if (!paused()) return 0;
        uint256 elapsedTime = block.timestamp - lastPauseTimestamp;
        if (elapsedTime >= pauseDuration) return 0;
        return pauseDuration - elapsedTime;
    }
}
