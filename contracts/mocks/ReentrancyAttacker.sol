// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../CrossChainMessenger.sol";

contract ReentrancyAttacker {
    CrossChainMessenger public messenger;
    uint256 public attackCount;
    bool public attacking;
    uint256 public constant ATTACK_VALUE = 1 ether;

    event AttackAttempted(uint256 attempt, bool success);

    constructor(address payable _messenger) {
        require(_messenger != address(0), "Invalid messenger address");
        messenger = CrossChainMessenger(_messenger);
    }

    // Main attack function that initiates the reentrancy attempt
    function attack() external payable {
        require(msg.value >= ATTACK_VALUE, "Insufficient ETH");
        require(!attacking, "Attack in progress");

        attacking = true;
        attackCount = 0;

        try messenger.sendToPolygon{value: ATTACK_VALUE}(address(this)) {
            emit AttackAttempted(attackCount, true);
        } catch Error(string memory reason) {
            require(
                keccak256(bytes(reason)) == keccak256(bytes("ReentrancyGuard: reentrant call")),
                "Unexpected revert reason"
            );
            emit AttackAttempted(attackCount, false);
            attacking = false;
        }
    }

    // Fallback function that attempts reentry
    receive() external payable {
        if (attacking && attackCount < 3) {
            attackCount++;
            // Attempt reentrant call
            messenger.sendToPolygon{value: ATTACK_VALUE}(address(this));
        }
    }
}
