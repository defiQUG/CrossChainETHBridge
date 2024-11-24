// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SecurityBase.sol";

contract RateLimiter is SecurityBase {
    uint256 private _maxMessagesPerPeriod;
    uint256 private _periodDuration;
    uint256 private _currentPeriodMessages;
    uint256 private _periodStart;
    bool private _initialized;

    constructor(uint256 maxMessages, uint256 periodDuration) {
        _initialize(maxMessages, periodDuration);
    }

    event RateLimitUpdated(uint256 maxMessages, uint256 period);
    event PeriodReset(uint256 timestamp);

    modifier whenInitialized() {
        require(_initialized, "RateLimiter: not initialized");
        _;
    }

    function _initialize(uint256 maxMessages, uint256 periodDuration) internal virtual {
        require(!_initialized, "RateLimiter: already initialized");
        require(maxMessages > 0, "RateLimiter: max messages must be positive");
        require(periodDuration > 0, "RateLimiter: period duration must be positive");

        _maxMessagesPerPeriod = maxMessages;
        _periodDuration = periodDuration;
        _periodStart = block.timestamp;
        _initialized = true;

        emit RateLimitUpdated(maxMessages, periodDuration);
    }

    function initializeRateLimiter(uint256 maxMessages, uint256 periodDuration) external virtual {
        _initialize(maxMessages, periodDuration);
    }

    function setRateLimit(uint256 maxMessages, uint256 periodDuration) external onlyOwner whenInitialized {
        require(maxMessages > 0, "RateLimiter: max messages must be positive");
        require(periodDuration > 0, "RateLimiter: period duration must be positive");
        _maxMessagesPerPeriod = maxMessages;
        _periodDuration = periodDuration;
        emit RateLimitUpdated(maxMessages, periodDuration);
    }

    function processMessage() public virtual override returns (bool) {
        require(_initialized, "RateLimiter: not initialized");

        if (block.timestamp >= _periodStart + _periodDuration) {
            _resetPeriod();
        }

        require(_currentPeriodMessages < _maxMessagesPerPeriod, "RateLimiter: rate limit exceeded");

        _currentPeriodMessages++;
        emit MessageProcessed(msg.sender, block.timestamp);
        return true;
    }

    function _resetPeriod() internal {
        _periodStart = block.timestamp;
        _currentPeriodMessages = 0;
        emit PeriodReset(block.timestamp);
    }

    function getCurrentPeriodMessages() external view whenInitialized returns (uint256) {
        return _currentPeriodMessages;
    }

    function getTimeUntilReset() external view whenInitialized returns (uint256) {
        if (block.timestamp >= _periodStart + _periodDuration) {
            return 0;
        }
        return (_periodStart + _periodDuration) - block.timestamp;
    }

    function getMaxMessagesPerPeriod() external view whenInitialized returns (uint256) {
        return _maxMessagesPerPeriod;
    }

    function getPeriodDuration() external view whenInitialized returns (uint256) {
        return _periodDuration;
    }
}
