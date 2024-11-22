// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RateLimiter is Ownable, Pausable {
    uint256 public constant RATE_PERIOD = 1 hours;
    uint256 public maxMessagesPerPeriod;
    mapping(uint256 => uint256) public messageCountByPeriod;

    event RateLimitUpdated(uint256 newLimit);
    event MessageProcessed(uint256 period);

    constructor(uint256 _maxMessagesPerPeriod) {
        maxMessagesPerPeriod = _maxMessagesPerPeriod;
        _transferOwnership(msg.sender);
    }

    function setMaxMessagesPerPeriod(uint256 _maxMessagesPerPeriod) external onlyOwner {
        maxMessagesPerPeriod = _maxMessagesPerPeriod;
        emit RateLimitUpdated(_maxMessagesPerPeriod);
    }

    function getCurrentPeriod() public view returns (uint256) {
        return block.timestamp / RATE_PERIOD;
    }

    // Changed from internal to public for testing
    function processMessage() public whenNotPaused {
        uint256 currentPeriod = getCurrentPeriod();
        require(
            messageCountByPeriod[currentPeriod] < maxMessagesPerPeriod,
            "Rate limit exceeded for current period"
        );
        messageCountByPeriod[currentPeriod]++;
        emit MessageProcessed(currentPeriod);
    }

    // Added internal function for contract inheritance
    function _processMessage() internal whenNotPaused {
        processMessage();
    }

    function emergencyPause() external onlyOwner {
        _pause();
    }

    function emergencyUnpause() external onlyOwner {
        _unpause();
    }
}
