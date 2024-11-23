// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract RateLimiter is Ownable {
    uint256 public maxMessagesPerPeriod;
    uint256 public periodDuration;
    uint256 public currentPeriodMessages;
    uint256 public periodStart;

    event RateLimitUpdated(uint256 maxMessages, uint256 period);
    event MessageProcessed(address indexed sender, uint256 timestamp);
    event PeriodReset(uint256 timestamp);

    constructor(uint256 _maxMessages, uint256 _periodDuration) {
        require(_maxMessages > 0, "Max messages must be positive");
        require(_periodDuration > 0, "Period duration must be positive");
        maxMessagesPerPeriod = _maxMessages;
        periodDuration = _periodDuration;
        periodStart = block.timestamp;
    }

    function setRateLimit(uint256 _maxMessages, uint256 _periodDuration) external onlyOwner {
        require(_maxMessages > 0, "Max messages must be positive");
        require(_periodDuration > 0, "Period duration must be positive");
        maxMessagesPerPeriod = _maxMessages;
        periodDuration = _periodDuration;
        emit RateLimitUpdated(_maxMessages, _periodDuration);
    }

    function processMessage() external virtual returns (bool) {
        if (block.timestamp >= periodStart + periodDuration) {
            _resetPeriod();
        }

        require(currentPeriodMessages < maxMessagesPerPeriod, "Rate limit exceeded");

        currentPeriodMessages++;
        emit MessageProcessed(msg.sender, block.timestamp);
        return true;
    }

    function _resetPeriod() internal {
        periodStart = block.timestamp;
        currentPeriodMessages = 0;
        emit PeriodReset(block.timestamp);
    }

    function getCurrentPeriodMessages() external view returns (uint256) {
        return currentPeriodMessages;
    }

    function getTimeUntilReset() external view returns (uint256) {
        if (block.timestamp >= periodStart + periodDuration) {
            return 0;
        }
        return (periodStart + periodDuration) - block.timestamp;
    }
}
