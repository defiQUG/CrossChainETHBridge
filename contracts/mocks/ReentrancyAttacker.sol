// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../CrossChainMessenger.sol";

contract ReentrancyAttacker {
    CrossChainMessenger public messenger;
    uint256 public attackCount;

    event AttackAttempted(uint256 value, uint256 count);
    event FallbackCalled(uint256 value);

    constructor(address payable _messenger) {
        require(_messenger != address(0), "Invalid messenger address");
        messenger = CrossChainMessenger(_messenger);
    }

    function attack() external payable {
        require(msg.value >= 1.1 ether, "Need at least 1.1 ETH"); // Extra for fees
        attackCount = 0;
        // Send enough to cover both transfer and fee
        messenger.sendToPolygon{value: msg.value}(address(this));
        emit AttackAttempted(msg.value, 0);
    }

    receive() external payable {
        emit FallbackCalled(msg.value);

        if (attackCount < 2 && address(this).balance >= 1.1 ether) {
            attackCount++;
            // Try to reenter with enough value for transfer and fee
            messenger.sendToPolygon{value: 1.1 ether}(address(this));
            emit AttackAttempted(1.1 ether, attackCount);
        }
    }
}
