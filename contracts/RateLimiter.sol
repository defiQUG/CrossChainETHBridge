// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract RateLimiter {
    uint256 public immutable maxMessagesPerPeriod;
    uint256 public immutable periodLength;
    uint256 public currentPeriodStart;
    uint256 public messageCount;

    event RateLimitUpdated(uint256 timestamp, uint256 count);
    event PeriodReset(uint256 timestamp);

    constructor(uint256 _maxMessagesPerPeriod, uint256 _periodLength) {
        require(_maxMessagesPerPeriod > 0, "Max messages must be positive");
        require(_periodLength > 0, "Period length must be positive");
        maxMessagesPerPeriod = _maxMessagesPerPeriod;
        periodLength = _periodLength;
        currentPeriodStart = block.timestamp;
    }

    function checkAndUpdateRateLimit() public returns (bool) {
        if (block.timestamp >= currentPeriodStart + periodLength) {
            currentPeriodStart = block.timestamp;
            messageCount = 0;
            emit PeriodReset(block.timestamp);
        }

        require(messageCount < maxMessagesPerPeriod, "Rate limit exceeded");
        messageCount++;
        emit RateLimitUpdated(block.timestamp, messageCount);
        return true;
    }

    function getCurrentPeriodMessageCount() public view returns (uint256) {
        return messageCount;
    }

    function timeUntilReset() public view returns (uint256) {
        uint256 periodEnd = currentPeriodStart + periodLength;
        if (block.timestamp >= periodEnd) return 0;
        return periodEnd - block.timestamp;
    }
}
