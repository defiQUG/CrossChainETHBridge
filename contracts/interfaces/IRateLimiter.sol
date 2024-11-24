```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IRateLimiter {
    error MaxMessagesMustBePositive();
    error PeriodDurationMustBePositive();
    error RateLimitExceeded();

    event RateLimitUpdated(uint256 maxMessages, uint256 period);
    event PeriodReset(uint256 timestamp);
    event MessageProcessed(address indexed sender, uint256 timestamp);

    function setRateLimit(uint256 maxMessages, uint256 periodDuration) external;
    function processMessage() external returns (bool);
    function getCurrentPeriod() external view returns (uint256);
    function getCurrentPeriodMessages() external view returns (uint256);
    function messageCountByPeriod(uint256 period) external view returns (uint256);
    function getTimeUntilReset() external view returns (uint256);
    function getMaxMessagesPerPeriod() external view returns (uint256);
    function getPeriodDuration() external view returns (uint256);
}
```
