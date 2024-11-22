// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../CrossChainMessenger.sol";

contract ReentrancyAttacker {
    CrossChainMessenger public messenger;
    uint256 public attackCount;
    uint256 public constant ATTACK_VALUE = 1 ether;
    bool public initialized;

    constructor(address payable _messenger) {
        messenger = CrossChainMessenger(_messenger);
        initialized = true;
    }

    receive() external payable {
        require(initialized, "Contract not initialized");
        if (attackCount < 2 && address(this).balance >= ATTACK_VALUE) {
            attackCount++;
            // Try to reenter the messenger contract
            messenger.sendToPolygon{value: ATTACK_VALUE}(address(this));
        }
    }

    function attack() external payable {
        require(initialized, "Contract not initialized");
        require(msg.value >= ATTACK_VALUE, "Need at least 1 ETH");
        attackCount = 0;
        messenger.sendToPolygon{value: ATTACK_VALUE}(address(this));
    }
}
