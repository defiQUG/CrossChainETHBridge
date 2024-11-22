// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../CrossChainMessenger.sol";
import "./MockRouter.sol";

contract ReentrancyAttacker {
    CrossChainMessenger public messenger;
    MockRouter public router;
    bool public attacking;
    uint256 public constant ATTACK_VALUE = 1 ether;

    event AttackAttempted(bool success);

    constructor(address payable _messenger, address _router) {
        require(_messenger != address(0) && _router != address(0), "Invalid addresses");
        messenger = CrossChainMessenger(_messenger);
        router = MockRouter(_router);
    }

    // Main attack function that initiates the reentrancy attempt
    function attack() external payable {
        require(msg.value >= ATTACK_VALUE, "Insufficient ETH");
        attacking = true;

        // First call to potentially trigger a refund
        try messenger.sendToPolygon{value: ATTACK_VALUE}(address(this)) {
            emit AttackAttempted(true);
        } catch {
            emit AttackAttempted(false);
        }
    }

    // Fallback function that attempts reentry during refund
    fallback() external payable {
        if (attacking) {
            attacking = false; // Prevent recursive fallback
            messenger.sendToPolygon{value: address(this).balance}(address(this));
        }
    }

    receive() external payable {}
}
