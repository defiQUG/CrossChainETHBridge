// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract RateLimiter is Ownable, Pausable {
    uint256 public maxMessagesPerPeriod;
    uint256 public periodDuration;
    uint256 public currentPeriodMessages;
    uint256 public periodStart;
    uint256 public pauseDuration;
    uint256 public lastPauseTimestamp;

    mapping(uint256 => uint256) private _messageCountByPeriod;

    event RateLimitUpdated(uint256 maxMessages, uint256 duration);
    event MessageProcessed(address indexed sender, uint256 timestamp);
    event PeriodReset(uint256 timestamp);
    event PauseDurationUpdated(uint256 duration);
    event EmergencyPauseActivated(uint256 timestamp, uint256 duration);

    constructor(uint256 _maxMessages, uint256 _periodDuration) {
        require(_maxMessages > 0, "Max messages must be positive");
        require(_periodDuration > 0, "Period duration must be positive");
        maxMessagesPerPeriod = _maxMessages;
        periodDuration = _periodDuration;
        periodStart = block.timestamp;
        pauseDuration = 1 hours; // Default pause duration
    }

    function checkPeriodReset() internal {
        uint256 currentPeriod = getCurrentPeriod();
        uint256 lastPeriod = (periodStart == 0) ? 0 : (periodStart / periodDuration);

        if (currentPeriod > lastPeriod) {
            _messageCountByPeriod[currentPeriod] = 0;
            currentPeriodMessages = 0;
            periodStart = block.timestamp;
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

    function processMessage() public whenNotPaused returns (bool) {
        checkPeriodReset();
        require(currentPeriodMessages < maxMessagesPerPeriod, "Rate limit exceeded");

        uint256 currentPeriod = getCurrentPeriod();
        currentPeriodMessages++;
        _messageCountByPeriod[currentPeriod]++;

        emit MessageProcessed(msg.sender, block.timestamp);
        return true;
    }

    function messageCountByPeriod(uint256 period) external view returns (uint256) {
        return _messageCountByPeriod[period];
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

    function getCurrentPeriod() public view returns (uint256) {
        return block.timestamp / periodDuration;
    }

    function emergencyPause() external onlyOwner {
        require(!paused(), "Already paused");
        lastPauseTimestamp = block.timestamp;
        _pause();
        emit EmergencyPauseActivated(block.timestamp, pauseDuration);
    }

    function setPauseDuration(uint256 _duration) external onlyOwner {
        require(_duration > 0, "Duration must be positive");
        pauseDuration = _duration;
        emit PauseDurationUpdated(_duration);
    }

    function emergencyUnpause() external onlyOwner {
        require(paused(), "Not paused");
        require(block.timestamp >= lastPauseTimestamp + pauseDuration, "Pause duration not elapsed");
        _unpause();
    }
}
