// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IRateLimiter.sol";
import "./SecurityBase.sol";

contract RateLimiter is IRateLimiter, SecurityBase {
    uint256 private _maxMessagesPerPeriod;
    uint256 private _periodDuration;
    uint256 private _currentPeriodMessages;
    uint256 private _periodStart;

    constructor(uint256 maxMessages, uint256 periodDuration) {
        // Set default values if not provided
        if (maxMessages == 0) maxMessages = 1000;
        if (periodDuration == 0) periodDuration = 3600; // 1 hour in seconds

        if (maxMessages == 0) revert MaxMessagesMustBePositive();
        if (periodDuration == 0) revert PeriodDurationMustBePositive();

        _maxMessagesPerPeriod = maxMessages;
        _periodDuration = periodDuration;
        _periodStart = block.timestamp;

        emit RateLimitUpdated(maxMessages, periodDuration);
    }

    function setRateLimit(uint256 maxMessages, uint256 periodDuration) external override onlyOwner {
        if (maxMessages == 0) revert MaxMessagesMustBePositive();
        if (periodDuration == 0) revert PeriodDurationMustBePositive();
        _maxMessagesPerPeriod = maxMessages;
        _periodDuration = periodDuration;
        emit RateLimitUpdated(maxMessages, periodDuration);
    }

    function processMessage() public virtual override returns (bool) {
        if (block.timestamp >= _periodStart + _periodDuration) {
            _resetPeriod();
        }

        if (_currentPeriodMessages >= _maxMessagesPerPeriod) revert RateLimitExceeded();

        _currentPeriodMessages++;
        emit MessageProcessed(msg.sender, block.timestamp);
        return true;
    }

    function _resetPeriod() internal {
        _periodStart = block.timestamp;
        _currentPeriodMessages = 0;
        emit PeriodReset(block.timestamp);
    }

    function getCurrentPeriod() external view override returns (uint256) {
        return (block.timestamp - _periodStart) / _periodDuration;
    }

    function getCurrentPeriodMessages() external view override returns (uint256) {
        return _currentPeriodMessages;
    }

    function messageCountByPeriod(uint256 period) external view override returns (uint256) {
        uint256 currentPeriod = (block.timestamp - _periodStart) / _periodDuration;
        if (period != currentPeriod) return 0;
        return _currentPeriodMessages;
    }

    function getTimeUntilReset() external view override returns (uint256) {
        if (block.timestamp >= _periodStart + _periodDuration) {
            return 0;
        }
        return (_periodStart + _periodDuration) - block.timestamp;
    }

    function getMaxMessagesPerPeriod() external view override returns (uint256) {
        return _maxMessagesPerPeriod;
    }

    function getPeriodDuration() external view override returns (uint256) {
        return _periodDuration;
    }
}
