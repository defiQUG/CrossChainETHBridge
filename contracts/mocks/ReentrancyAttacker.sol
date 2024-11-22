// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../CrossChainMessenger.sol";

contract ReentrancyAttacker {
    CrossChainMessenger public messenger;
    uint256 public attackCount;

    constructor(address payable _messenger) {
        require(_messenger != address(0), "Invalid messenger address");
        messenger = CrossChainMessenger(_messenger);
    }

    function attack() external payable {
        // Initial call to trigger reentrancy
        messenger.sendToPolygon{value: msg.value}(address(this));
    }

    // Receive function that attempts immediate reentry
    receive() external payable {
        if (attackCount == 0) {
            attackCount++;
            // Immediate reentrant call attempt with remaining balance
            messenger.sendToPolygon{value: address(this).balance}(address(this));
        }
    }
}
