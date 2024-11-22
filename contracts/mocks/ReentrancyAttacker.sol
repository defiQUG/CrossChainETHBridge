// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../CrossChainMessenger.sol";

contract ReentrancyAttacker {
    CrossChainMessenger public messenger;
    uint256 public attackCount;
    uint256 public constant ATTACK_VALUE = 1 ether;

    constructor(address payable _messenger) {
        require(_messenger != address(0), "Invalid messenger address");
        messenger = CrossChainMessenger(_messenger);
    }

    function attack() external payable {
        require(msg.value >= ATTACK_VALUE, "Need at least 1 ETH");
        require(address(this).balance >= ATTACK_VALUE * 2, "Insufficient balance for attack");
        attackCount = 0;
        // Initial call to trigger reentrancy
        messenger.sendToPolygon{value: ATTACK_VALUE}(address(this));
    }

    // Receive function that attempts immediate reentry
    receive() external payable {
        if (attackCount == 0 && address(this).balance >= ATTACK_VALUE) {
            attackCount++;
            // Immediate reentrant call attempt
            messenger.sendToPolygon{value: ATTACK_VALUE}(address(this));
        }
    }
}
