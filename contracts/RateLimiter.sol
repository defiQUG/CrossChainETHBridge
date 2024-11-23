// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract RateLimiter {
    uint256 public rateLimit;
    uint256 public rateLimitPeriod;
    mapping(address => uint256) public lastTransferTime;
    mapping(address => uint256) public transferredAmount;

    event RateLimitUpdated(uint256 newLimit, uint256 newPeriod);

    constructor(uint256 _rateLimit, uint256 _rateLimitPeriod) {
        rateLimit = _rateLimit;
        rateLimitPeriod = _rateLimitPeriod;
    }

    function checkRateLimit(address user, uint256 amount) public view returns (bool) {
        if (block.timestamp >= lastTransferTime[user] + rateLimitPeriod) {
            return amount <= rateLimit;
        }
        return transferredAmount[user] + amount <= rateLimit;
    }

    function updateTransferredAmount(address user, uint256 amount) internal {
        if (block.timestamp >= lastTransferTime[user] + rateLimitPeriod) {
            transferredAmount[user] = amount;
        } else {
            transferredAmount[user] += amount;
        }
        lastTransferTime[user] = block.timestamp;
    }
}
