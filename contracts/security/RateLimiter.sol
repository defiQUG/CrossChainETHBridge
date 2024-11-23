// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract RateLimiter is Ownable, Pausable {
    uint256 public maxMessagesPerPeriod;
    uint256 public periodDuration;
    uint256 public currentPeriodStart;
    uint256 public messageCount;
    mapping(uint256 => uint256) private messageCountsByPeriod;

    event RateLimitUpdated(uint256 maxMessages, uint256 duration);
    event MessageProcessed(address indexed sender, uint256 timestamp);
    event PeriodReset(uint256 timestamp);

    constructor(uint256 _maxMessages, uint256 _periodDuration) {
        require(_maxMessages > 0, "Max messages must be positive");
        require(_periodDuration > 0, "Period duration must be positive");
        maxMessagesPerPeriod = _maxMessages;
        periodDuration = _periodDuration;
        currentPeriodStart = block.timestamp;
    }

    function getCurrentPeriod() public view returns (uint256) {
        return currentPeriodStart;
    }

    function messageCountByPeriod(uint256 period) external view returns (uint256) {
        return messageCountsByPeriod[period];
    }

    function checkRateLimit() public view returns (bool) {
        if (block.timestamp >= currentPeriodStart + periodDuration) {
            return true;
        }
        return messageCount < maxMessagesPerPeriod;
    }

    function checkAndUpdateRateLimit() external whenNotPaused {
        require(checkRateLimit(), "Rate limit exceeded");
        if (block.timestamp >= currentPeriodStart + periodDuration) {
            messageCount = 0;
            currentPeriodStart = block.timestamp;
            emit PeriodReset(block.timestamp);
        }
        messageCount++;
        messageCountsByPeriod[currentPeriodStart] = messageCount;
        emit MessageProcessed(msg.sender, block.timestamp);
    }

    function getCurrentMessageCount() external view returns (uint256) {
        return messageCount;
    }

    function getRemainingMessages() external view returns (uint256) {
        if (block.timestamp >= currentPeriodStart + periodDuration) {
            return maxMessagesPerPeriod;
        }
        return maxMessagesPerPeriod - messageCount;
    }

    function getTimeUntilReset() external view returns (uint256) {
        uint256 periodEnd = currentPeriodStart + periodDuration;
        if (block.timestamp >= periodEnd) {
            return 0;
        }
        return periodEnd - block.timestamp;
    }

    function setRateLimit(uint256 _maxMessages, uint256 _periodDuration) external onlyOwner {
        require(_maxMessages > 0, "Max messages must be positive");
        require(_periodDuration > 0, "Period duration must be positive");
        maxMessagesPerPeriod = _maxMessages;
        periodDuration = _periodDuration;
        emit RateLimitUpdated(_maxMessages, _periodDuration);
    }

    function setMaxMessagesPerPeriod(uint256 _maxMessages) external onlyOwner {
        require(_maxMessages > 0, "Max messages must be positive");
        maxMessagesPerPeriod = _maxMessages;
        emit RateLimitUpdated(_maxMessages, periodDuration);
    }

    function emergencyPause() external onlyOwner {
        _pause();
    }

    function emergencyUnpause() external onlyOwner {
        _unpause();
    }
}
