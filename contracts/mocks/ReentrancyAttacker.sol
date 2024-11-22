// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../CrossChainMessenger.sol";
import "./MockRouter.sol";

contract ReentrancyAttacker {
    CrossChainMessenger public messenger;
    MockRouter public router;
    uint256 public attackCount;
    uint256 public constant ATTACK_VALUE = 1 ether;
    bool public initialized;
    bool public attacking;

    constructor(address payable _messenger, address _router) {
        messenger = CrossChainMessenger(_messenger);
        router = MockRouter(_router);
        initialized = true;
    }

    // Fallback function to handle ETH transfers
    fallback() external payable {
        if (attacking && initialized && address(this).balance >= ATTACK_VALUE) {
            attacking = false; // Prevent recursive fallback calls
            messenger.sendToPolygon{value: ATTACK_VALUE}(address(this));
        }
    }

    // Receive function required for ETH transfers
    receive() external payable {}

    function attack() external payable {
        require(initialized, "Contract not initialized");
        require(msg.value >= ATTACK_VALUE, "Need at least 1 ETH");
        attacking = true;
        messenger.sendToPolygon{value: ATTACK_VALUE}(address(this));
    }
}
