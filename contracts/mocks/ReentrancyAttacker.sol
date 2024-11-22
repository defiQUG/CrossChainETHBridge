// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../CrossChainMessenger.sol";
import "./MockRouter.sol";

contract ReentrancyAttacker {
    CrossChainMessenger public messenger;
    MockRouter public router;
    uint256 public attackCount;
    uint256 public constant ATTACK_VALUE = 1 ether;
    uint256 public constant FEE_BUFFER = 0.1 ether;

    event AttackAttempted(uint256 value, uint256 count);
    event FallbackCalled(uint256 value);

    constructor(address payable _messenger, address payable _router) payable {
        require(_messenger != address(0), "Invalid messenger address");
        require(_router != address(0), "Invalid router address");
        require(msg.value >= ATTACK_VALUE + FEE_BUFFER, "Insufficient initial ETH");
        messenger = CrossChainMessenger(_messenger);
        router = MockRouter(_router);
    }

    receive() external payable {
        emit FallbackCalled(msg.value);

        if (attackCount < 2) {
            attackCount++;

            // Try to reenter through a new sendToPolygon call
            try messenger.sendToPolygon{value: ATTACK_VALUE}(address(this)) {
                emit AttackAttempted(ATTACK_VALUE, attackCount);
            } catch {
                // Attack failed as expected
                emit AttackAttempted(0, attackCount);
            }
        }
    }

    function attack() external payable {
        require(address(this).balance >= ATTACK_VALUE, "Insufficient contract balance");
        attackCount = 0;
        messenger.sendToPolygon{value: ATTACK_VALUE}(address(this));
        emit AttackAttempted(ATTACK_VALUE, 0);
    }
}
