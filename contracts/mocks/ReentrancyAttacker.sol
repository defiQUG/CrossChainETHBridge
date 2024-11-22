// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../CrossChainMessenger.sol";

contract ReentrancyAttacker {
    CrossChainMessenger public messenger;
    uint256 public attackCount;
    uint256 public constant ATTACK_VALUE = 1 ether;

    receive() external payable {
        if (attackCount < 2 && address(this).balance >= ATTACK_VALUE) {
            attackCount++;
            // Try to reenter the messenger contract
            messenger.sendToPolygon{value: ATTACK_VALUE}(address(this));
        }
    }

    function attack(address payable _messenger) external payable {
        require(msg.value >= ATTACK_VALUE, "Need at least 1 ETH");
        messenger = CrossChainMessenger(_messenger);
        attackCount = 0;
        messenger.sendToPolygon{value: ATTACK_VALUE}(address(this));
    }
}
