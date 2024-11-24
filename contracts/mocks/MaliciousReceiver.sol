// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../CrossChainMessenger.sol";

contract MaliciousReceiver {
    CrossChainMessenger public immutable messenger;
    uint256 public attackCount;

    constructor(address _messenger) {
        messenger = CrossChainMessenger(_messenger);
    }

    // Fallback function that attempts reentrancy
    receive() external payable {
        if (attackCount < 2) {
            attackCount++;
            // Try to reenter the contract
            messenger.emergencyWithdraw(address(this));
        }
    }

    // Function to check if attack was successful
    function getAttackCount() external view returns (uint256) {
        return attackCount;
    }
}
