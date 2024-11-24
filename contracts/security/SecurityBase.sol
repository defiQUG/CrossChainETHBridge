// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "../interfaces/ISecurityBase.sol";

abstract contract SecurityBase is ISecurityBase, Ownable, Pausable {
    uint256 private constant SECONDS_PER_DAY = 86400;
    uint256 private _maxMessagesPerPeriod;
    uint256 private _periodDuration;
    mapping(uint256 => uint256) private _messagesByPeriod;
    uint256 private _lastResetTimestamp;

    constructor(uint256 maxMessages, uint256 periodDuration) {
        require(maxMessages > 0, "SecurityBase: Max messages must be positive");
        require(periodDuration > 0, "SecurityBase: Period duration must be positive");
        _maxMessagesPerPeriod = maxMessages;
        _periodDuration = periodDuration;
        _lastResetTimestamp = block.timestamp;
    }

    function setRateLimit(uint256 maxMessages, uint256 periodDuration) external virtual override onlyOwner {
        require(maxMessages > 0, "SecurityBase: Max messages must be positive");
        require(periodDuration > 0, "SecurityBase: Period duration must be positive");
        _maxMessagesPerPeriod = maxMessages;
        _periodDuration = periodDuration;
        emit RateLimitUpdated(maxMessages, periodDuration);
    }

    function processMessage() public virtual override returns (bool) {
        require(!paused(), "SecurityBase: Contract is paused");
        uint256 currentPeriod = getCurrentPeriod();
        uint256 currentCount = _messagesByPeriod[currentPeriod];
        require(currentCount < _maxMessagesPerPeriod, "SecurityBase: Rate limit exceeded");
        _messagesByPeriod[currentPeriod] = currentCount + 1;
        emit MessageProcessed(msg.sender, block.timestamp);
        return true;
    }

    function getCurrentPeriod() public view virtual override returns (uint256) {
        return (block.timestamp - _lastResetTimestamp) / _periodDuration;
    }

    function getCurrentPeriodMessages() external view virtual override returns (uint256) {
        return _messagesByPeriod[getCurrentPeriod()];
    }

    function messageCountByPeriod(uint256 period) external view virtual override returns (uint256) {
        return _messagesByPeriod[period];
    }

    function getTimeUntilReset() external view virtual override returns (uint256) {
        uint256 currentPeriod = getCurrentPeriod();
        uint256 nextResetTime = _lastResetTimestamp + ((currentPeriod + 1) * _periodDuration);
        return nextResetTime - block.timestamp;
    }

    function getMaxMessagesPerPeriod() external view virtual override returns (uint256) {
        return _maxMessagesPerPeriod;
    }

    function getPeriodDuration() external view virtual override returns (uint256) {
        return _periodDuration;
    }
}
