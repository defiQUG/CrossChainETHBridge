// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SecurityBase.sol";

contract EmergencyPause is SecurityBase {
    uint256 public pauseThreshold;
    uint256 public messageCount;
    uint256 public constant EMERGENCY_DELAY = 24 hours;
    uint256 public lastPauseTimestamp;

    event PauseThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event MessageProcessed(address indexed sender, uint256 timestamp);
    event EmergencyPauseTriggered(uint256 timestamp);

    constructor(uint256 _pauseThreshold) {
        require(_pauseThreshold > 0, "Pause threshold must be positive");
        pauseThreshold = _pauseThreshold;
    }

    function processMessage() external whenNotPaused returns (bool) {
        messageCount++;
        emit MessageProcessed(msg.sender, block.timestamp);

        if (messageCount >= pauseThreshold) {
            _triggerEmergencyPause();
        }

        return true;
    }

    function _triggerEmergencyPause() internal {
        lastPauseTimestamp = block.timestamp;
        _pause();
        emit EmergencyPauseTriggered(block.timestamp);
    }

    function setPauseThreshold(uint256 _pauseThreshold) external onlyOwner {
        require(_pauseThreshold > 0, "Pause threshold must be positive");
        uint256 oldThreshold = pauseThreshold;
        pauseThreshold = _pauseThreshold;
        emit PauseThresholdUpdated(oldThreshold, _pauseThreshold);
    }

    function getMessageCount() external view returns (uint256) {
        return messageCount;
    }

    function getRemainingUntilPause() external view returns (uint256) {
        if (paused()) {
            return 0;
        }
        return pauseThreshold > messageCount ? pauseThreshold - messageCount : 0;
    }

    function getTimeUntilUnpause() external view returns (uint256) {
        if (!paused()) {
            return 0;
        }
        uint256 unpauseTime = lastPauseTimestamp + EMERGENCY_DELAY;
        return block.timestamp >= unpauseTime ? 0 : unpauseTime - block.timestamp;
    }

    function emergencyUnpause() external override onlyOwner {
        require(
            block.timestamp >= lastPauseTimestamp + EMERGENCY_DELAY,
            "Emergency delay not elapsed"
        );
        messageCount = 0;
        super.emergencyUnpause();
    }
}
