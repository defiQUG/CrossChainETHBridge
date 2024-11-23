// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SecurityBase.sol";

contract RateLimiter is SecurityBase {
    uint256 public maxMessagesPerPeriod;
    uint256 public periodDuration;
    uint256 public currentPeriodStart;
    uint256 private messageCount;
    mapping(uint256 => uint256) private messageCountsByPeriod;

    event RateLimitUpdated(uint256 maxMessages, uint256 duration);
    event PeriodReset(uint256 timestamp);
    event MessageProcessed(address indexed sender, uint256 timestamp);

    constructor(uint256 _maxMessages, uint256 _periodDuration) {
        require(_maxMessages > 0, "Max messages must be positive");
        require(_periodDuration > 0, "Period duration must be positive");
        maxMessagesPerPeriod = _maxMessages;
        periodDuration = _periodDuration;
        currentPeriodStart = block.timestamp;
        messageCount = 0;
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

    function processMessage() public virtual whenNotPaused returns (bool) {
        require(checkRateLimit(), "Rate limit exceeded");
        if (block.timestamp >= currentPeriodStart + periodDuration) {
            messageCount = 0;
            currentPeriodStart = block.timestamp;
            emit PeriodReset(block.timestamp);
        }
        messageCount++;
        messageCountsByPeriod[currentPeriodStart] = messageCount;
        emit MessageProcessed(msg.sender, block.timestamp);
        return true;
    }

    function checkAndUpdateRateLimit() external whenNotPaused {
        require(processMessage(), "Rate limit exceeded");
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
}
