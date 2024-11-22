// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../CrossChainMessenger.sol";
import "./MockRouter.sol";

contract ReentrancyAttacker {
    CrossChainMessenger public messenger;
    MockRouter public router;
    uint256 public attackCount;
    uint256 public constant ATTACK_VALUE = 1 ether;
    bool public attacking;

    event AttackAttempted(uint256 attempt, bool success);

    constructor(address payable _messenger, address _router) {
        require(_messenger != address(0) && _router != address(0), "Invalid addresses");
        messenger = CrossChainMessenger(_messenger);
        router = MockRouter(_router);
    }

    // Main attack function that initiates the reentrancy attempt
    function attack() external payable {
        require(msg.value >= ATTACK_VALUE, "Insufficient ETH");
        require(!attacking, "Attack in progress");

        attacking = true;
        attackCount = 0;

        // First call to trigger the reentrant condition
        try messenger.sendToPolygon{value: ATTACK_VALUE}(address(this)) {
            emit AttackAttempted(attackCount, true);
        } catch Error(string memory reason) {
            // Check if the revert was due to reentrancy guard
            require(
                keccak256(bytes(reason)) == keccak256(bytes("ReentrancyGuard: reentrant call")),
                "Unexpected revert reason"
            );
            emit AttackAttempted(attackCount, false);
            attacking = false;
        }
    }

    // Fallback function that attempts reentry
    fallback() external payable {
        if (attacking && attackCount < 3) {
            attackCount++;
            // Attempt reentrant call
            messenger.sendToPolygon{value: address(this).balance}(address(this));
        }
    }

    // Receive function that attempts reentry
    receive() external payable {
        if (attacking && attackCount < 3) {
            attackCount++;
            // Attempt reentrant call
            messenger.sendToPolygon{value: address(this).balance}(address(this));
        }
    }
}
