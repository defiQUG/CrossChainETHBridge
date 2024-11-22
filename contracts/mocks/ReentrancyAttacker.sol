// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../CrossChainMessenger.sol";

contract ReentrancyAttacker {
    CrossChainMessenger public messenger;
    uint256 public attackCount;
    uint256 public constant ATTACK_VALUE = 1 ether;

    event AttackAttempted(uint256 value, uint256 count);

    constructor(address payable _messenger) {
        require(_messenger != address(0), "Invalid messenger address");
        messenger = CrossChainMessenger(_messenger);
    }

    function attack() external payable {
        require(msg.value >= ATTACK_VALUE, "Need at least 1 ETH");
        attackCount = 0;
        // Initial call to trigger reentrancy
        messenger.sendToPolygon{value: ATTACK_VALUE}(address(this));
    }

    // Fallback function that attempts reentry
    fallback() external payable {
        if (attackCount == 0) {
            attackCount++;
            emit AttackAttempted(address(this).balance, attackCount);
            // Try to reenter during the first message processing
            (bool success,) = address(messenger).call{value: ATTACK_VALUE}(
                abi.encodeWithSignature("sendToPolygon(address)", address(this))
            );
            require(success, "Reentrant call failed");
        }
    }

    receive() external payable {}
}
