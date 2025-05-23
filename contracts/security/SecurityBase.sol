// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "../interfaces/ISecurityBase.sol";

error RateLimitExceeded();
error ContractPaused();
error InvalidPeriodDuration();
error InvalidMaxMessages();

abstract contract SecurityBase is ISecurityBase, Ownable, Pausable {
    uint256 private constant SECONDS_PER_DAY = 86400;
    uint256 private _maxMessagesPerPeriod;
    uint256 private _periodDuration;
    mapping(uint256 => uint256) private _messagesByPeriod;
    uint256 private _lastResetTimestamp;

    constructor(uint256 maxMessages, uint256 periodDuration) {
        if (maxMessages == 0) revert InvalidMaxMessages();
        if (periodDuration == 0) revert InvalidPeriodDuration();
        _maxMessagesPerPeriod = maxMessages;
        _periodDuration = periodDuration;
        _lastResetTimestamp = block.timestamp;
    }

    function setRateLimit(
        uint256 maxMessages,
        uint256 periodDuration
    ) external virtual override onlyOwner {
        if (maxMessages == 0) revert InvalidMaxMessages();
        if (periodDuration == 0) revert InvalidPeriodDuration();
        _maxMessagesPerPeriod = maxMessages;
        _periodDuration = periodDuration;
        emit RateLimitUpdated(maxMessages, periodDuration);
    }

    function processMessage() public virtual override returns (bool) {
        if (paused()) revert ContractPaused();

        uint256 currentTimestamp = block.timestamp;
        uint256 currentPeriod = (currentTimestamp - _lastResetTimestamp) /
            _periodDuration;

        // Reset counter if we've moved to a new period
        if (currentPeriod > getCurrentPeriod()) {
            _messagesByPeriod[currentPeriod] = 0;
            _lastResetTimestamp =
                currentTimestamp -
                (currentTimestamp % _periodDuration);
        }

        uint256 currentCount = _messagesByPeriod[currentPeriod];
        if (currentCount >= _maxMessagesPerPeriod) revert RateLimitExceeded();

        _messagesByPeriod[currentPeriod] = currentCount + 1;
        emit MessageProcessed(msg.sender, currentTimestamp);
        return true;
    }

    function getCurrentPeriod() public view virtual override returns (uint256) {
        return (block.timestamp - _lastResetTimestamp) / _periodDuration;
    }

    function getCurrentPeriodMessages()
        external
        view
        virtual
        override
        returns (uint256)
    {
        return _messagesByPeriod[getCurrentPeriod()];
    }

    function messageCountByPeriod(
        uint256 period
    ) external view virtual override returns (uint256) {
        return _messagesByPeriod[period];
    }

    function getTimeUntilReset()
        external
        view
        virtual
        override
        returns (uint256)
    {
        uint256 currentPeriod = getCurrentPeriod();
        uint256 nextResetTime = _lastResetTimestamp +
            ((currentPeriod + 1) * _periodDuration);
        return nextResetTime - block.timestamp;
    }

    function getMaxMessagesPerPeriod()
        public
        view
        virtual
        override
        returns (uint256)
    {
        return _maxMessagesPerPeriod;
    }

    function getPeriodDuration()
        external
        view
        virtual
        override
        returns (uint256)
    {
        return _periodDuration;
    }
}
