// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SecurityBase.sol";

contract RateLimiter is SecurityBase {
    uint256 private _maxMessagesPerPeriod;
    uint256 private _periodDuration;
    uint256 private _currentPeriodMessages;
    uint256 private _periodStart;

    event RateLimitUpdated(uint256 maxMessages, uint256 period);
    event PeriodReset(uint256 timestamp);

    constructor(uint256 maxMessages, uint256 periodDuration) {
        require(maxMessages > 0, "Rate limit exceeded");
        require(periodDuration > 0, "Period duration must be positive");

        _maxMessagesPerPeriod = maxMessages;
        _periodDuration = periodDuration;
        _periodStart = block.timestamp;

        emit RateLimitUpdated(maxMessages, periodDuration);
    }

    function setRateLimit(uint256 maxMessages, uint256 periodDuration) external onlyOwner {
        require(maxMessages > 0, "Rate limit exceeded");
        require(periodDuration > 0, "Period duration must be positive");
        _maxMessagesPerPeriod = maxMessages;
        _periodDuration = periodDuration;
        emit RateLimitUpdated(maxMessages, periodDuration);
    }

    function processMessage() public virtual override returns (bool) {
        if (block.timestamp >= _periodStart + _periodDuration) {
            _resetPeriod();
        }

        require(_currentPeriodMessages < _maxMessagesPerPeriod, "Rate limit exceeded");

        _currentPeriodMessages++;
        emit MessageProcessed(msg.sender, block.timestamp);
        return true;
    }

    function _resetPeriod() internal {
        _periodStart = block.timestamp;
        _currentPeriodMessages = 0;
        emit PeriodReset(block.timestamp);
    }

    function getCurrentPeriod() external view returns (uint256) {
        return (block.timestamp - _periodStart) / _periodDuration;
    }

    function getCurrentPeriodMessages() external view returns (uint256) {
        return _currentPeriodMessages;
    }

    function getTimeUntilReset() external view returns (uint256) {
        if (block.timestamp >= _periodStart + _periodDuration) {
            return 0;
        }
        return (_periodStart + _periodDuration) - block.timestamp;
    }

    function getMaxMessagesPerPeriod() external view returns (uint256) {
        return _maxMessagesPerPeriod;
    }

    function getPeriodDuration() external view returns (uint256) {
        return _periodDuration;
    }
}
