// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract RateLimiter is Ownable {
    uint256 public maxMessagesPerPeriod;
    uint256 public periodDuration;
    uint256 public currentPeriodStart;
    uint256 public messageCount;

    event RateLimitUpdated(uint256 maxMessages, uint256 duration);
    event MessageProcessed(uint256 timestamp, uint256 count);
    event PeriodReset(uint256 timestamp);

    constructor(uint256 _maxMessages, uint256 _periodDuration) {
        require(_maxMessages > 0, "Max messages must be positive");
        require(_periodDuration > 0, "Period duration must be positive");
        maxMessagesPerPeriod = _maxMessages;
        periodDuration = _periodDuration;
        currentPeriodStart = block.timestamp;
        _transferOwnership(msg.sender);
    }

    function setMaxMessagesPerPeriod(uint256 _maxMessages) external onlyOwner {
        require(_maxMessages > 0, "Max messages must be positive");
        maxMessagesPerPeriod = _maxMessages;
        emit RateLimitUpdated(_maxMessages, periodDuration);
    }

    function setPeriodDuration(uint256 _periodDuration) external onlyOwner {
        require(_periodDuration > 0, "Period duration must be positive");
        periodDuration = _periodDuration;
        emit RateLimitUpdated(maxMessagesPerPeriod, _periodDuration);
    }

    function checkPeriodReset() internal {
        if (block.timestamp >= currentPeriodStart + periodDuration) {
            currentPeriodStart = block.timestamp;
            messageCount = 0;
            emit PeriodReset(block.timestamp);
        }
    }

    function processMessage() external returns (bool) {
        checkPeriodReset();
        require(messageCount < maxMessagesPerPeriod, "Rate limit exceeded");

        messageCount++;
        emit MessageProcessed(block.timestamp, messageCount);
        return true;
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
}
