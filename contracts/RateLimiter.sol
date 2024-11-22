// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RateLimiter is Pausable, Ownable {
    uint256 public constant RATE_PERIOD = 1 hours;
    uint256 public maxMessagesPerPeriod;
    mapping(uint256 => uint256) public messageCountByPeriod;

    event RateLimitUpdated(uint256 newLimit);
    event MessageProcessed(uint256 period);

    constructor(uint256 _maxMessagesPerPeriod) {
        maxMessagesPerPeriod = _maxMessagesPerPeriod;
    }

    function setMaxMessagesPerPeriod(uint256 _maxMessagesPerPeriod) external onlyOwner {
        maxMessagesPerPeriod = _maxMessagesPerPeriod;
        emit RateLimitUpdated(_maxMessagesPerPeriod);
    }

    function getCurrentPeriod() public view returns (uint256) {
        return block.timestamp / RATE_PERIOD;
    }

    function processMessage() external whenNotPaused returns (bool) {
        uint256 currentPeriod = getCurrentPeriod();
        require(
            messageCountByPeriod[currentPeriod] < maxMessagesPerPeriod,
            "Rate limit exceeded for current period"
        );
        messageCountByPeriod[currentPeriod]++;
        emit MessageProcessed(currentPeriod);
        return true;
    }

    function emergencyPause() external onlyOwner {
        _pause();
    }

    function emergencyUnpause() external onlyOwner {
        _unpause();
    }
}
