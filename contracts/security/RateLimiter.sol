// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract RateLimiter is Ownable {
    uint256 public maxMessagesPerPeriod;
    uint256 public periodDuration;
    uint256 public currentPeriodMessages;
    uint256 public periodStart;
    bool public paused;
    uint256 public pauseDuration;
    uint256 public pauseStart;

    event RateLimitUpdated(uint256 maxMessages, uint256 duration);
    event MessageProcessed(address indexed sender, uint256 timestamp);
    event PeriodReset(uint256 timestamp);
    event EmergencyPaused(uint256 timestamp, uint256 duration);
    event EmergencyUnpaused(uint256 timestamp);

    constructor(uint256 _maxMessages, uint256 _periodDuration) {
        require(_maxMessages > 0, "Max messages must be positive");
        require(_periodDuration > 0, "Period duration must be positive");
        maxMessagesPerPeriod = _maxMessages;
        periodDuration = _periodDuration;
        periodStart = block.timestamp;
        pauseDuration = 1 hours; // Default pause duration
    }

    function checkPeriodReset() internal {
        if (block.timestamp >= periodStart + periodDuration) {
            periodStart = block.timestamp;
            currentPeriodMessages = 0;
            emit PeriodReset(block.timestamp);
        }
    }

    function setRateLimit(uint256 _maxMessages, uint256 _periodDuration) public onlyOwner {
        require(_maxMessages > 0, "Max messages must be positive");
        require(_periodDuration > 0, "Period duration must be positive");
        maxMessagesPerPeriod = _maxMessages;
        periodDuration = _periodDuration;
        emit RateLimitUpdated(_maxMessages, _periodDuration);
    }

    function setMaxMessagesPerPeriod(uint256 _maxMessages) external onlyOwner {
        setRateLimit(_maxMessages, periodDuration);
    }

    function processMessage() public returns (bool) {
        require(!paused || block.timestamp >= pauseStart + pauseDuration, "Contract paused");
        if (paused && block.timestamp >= pauseStart + pauseDuration) {
            paused = false;
            emit EmergencyUnpaused(block.timestamp);
        }
        checkPeriodReset();
        require(currentPeriodMessages < maxMessagesPerPeriod, "Rate limit exceeded");
        currentPeriodMessages++;
        emit MessageProcessed(msg.sender, block.timestamp);
        return true;
    }

    function getCurrentPeriodMessages() external view returns (uint256) {
        return currentPeriodMessages;
    }

    function getPeriodStart() external view returns (uint256) {
        return periodStart;
    }

    function getRemainingMessages() external view returns (uint256) {
        if (block.timestamp >= periodStart + periodDuration) {
            return maxMessagesPerPeriod;
        }
        return maxMessagesPerPeriod - currentPeriodMessages;
    }

    function getCurrentPeriod() external view returns (uint256) {
        return (block.timestamp - periodStart) / periodDuration;
    }

    function emergencyPause() external onlyOwner {
        require(!paused, "Already paused");
        paused = true;
        pauseStart = block.timestamp;
        emit EmergencyPaused(block.timestamp, pauseDuration);
    }

    function setPauseDuration(uint256 _duration) external onlyOwner {
        require(_duration > 0, "Duration must be positive");
        pauseDuration = _duration;
    }
}
