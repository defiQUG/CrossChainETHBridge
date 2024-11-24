// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IEmergencyPause {
    function setPauseThreshold(uint256 _pauseThreshold) external;
    function setPauseDuration(uint256 _pauseDuration) external;
    function checkAndPause(uint256 amount) external returns (bool);
    function checkAndUnpause() external;
    function checkAndUpdateValue(uint256 amount) external returns (bool);
    function lockValue(uint256 amount) external;
    function unlockValue(uint256 amount) external;
    function emergencyUnpause() external;
    function getRemainingPauseDuration() external view returns (uint256);

    event PauseThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event PauseDurationUpdated(uint256 oldDuration, uint256 newDuration);
    event ValueLocked(uint256 amount);
    event ValueUnlocked(uint256 amount);
    event EmergencyPauseTriggered(uint256 timestamp, uint256 duration);
    event EmergencyUnpauseTriggered(uint256 timestamp);
}
