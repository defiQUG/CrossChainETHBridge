// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract RateLimiter is Ownable {
    uint256 private _maxMessagesPerPeriod;
    uint256 private _periodLength;
    uint256 public currentPeriodStart;
    uint256 public messageCount;

    event RateLimitUpdated(uint256 timestamp, uint256 count);
    event PeriodReset(uint256 timestamp);
    event MaxMessagesUpdated(uint256 oldLimit, uint256 newLimit);
    event PeriodLengthUpdated(uint256 oldLength, uint256 newLength);

    constructor(uint256 initialMaxMessages, uint256 initialPeriodLength) {
        require(initialMaxMessages > 0, "Max messages must be positive");
        require(initialPeriodLength > 0, "Period length must be positive");
        _maxMessagesPerPeriod = initialMaxMessages;
        _periodLength = initialPeriodLength;
        currentPeriodStart = block.timestamp;
    }

    function maxMessagesPerPeriod() public view returns (uint256) {
        return _maxMessagesPerPeriod;
    }

    function periodLength() public view returns (uint256) {
        return _periodLength;
    }

    function setMaxMessagesPerPeriod(uint256 newLimit) public onlyOwner {
        require(newLimit > 0, "Max messages must be positive");
        uint256 oldLimit = _maxMessagesPerPeriod;
        _maxMessagesPerPeriod = newLimit;
        emit MaxMessagesUpdated(oldLimit, newLimit);
    }

    function setPeriodLength(uint256 newLength) public onlyOwner {
        require(newLength > 0, "Period length must be positive");
        uint256 oldLength = _periodLength;
        _periodLength = newLength;
        emit PeriodLengthUpdated(oldLength, newLength);
    }

    function checkAndUpdateRateLimit() public returns (bool) {
        if (block.timestamp >= currentPeriodStart + _periodLength) {
            currentPeriodStart = block.timestamp;
            messageCount = 0;
            emit PeriodReset(block.timestamp);
        }

        require(messageCount < _maxMessagesPerPeriod, "Rate limit exceeded");
        messageCount++;
        emit RateLimitUpdated(block.timestamp, messageCount);
        return true;
    }

    function getCurrentPeriodMessageCount() public view returns (uint256) {
        return messageCount;
    }

    function timeUntilReset() public view returns (uint256) {
        uint256 periodEnd = currentPeriodStart + _periodLength;
        if (block.timestamp >= periodEnd) return 0;
        return periodEnd - block.timestamp;
    }
}
