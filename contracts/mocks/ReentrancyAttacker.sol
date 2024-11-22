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
        messenger = CrossChainMessenger(_messenger);
        router = MockRouter(_router);
    }

    receive() external payable {
        emit FallbackCalled(msg.value);

        if (attackCount < 2) {
            attackCount++;

            // Encode the reentrant message data
            bytes memory data = abi.encode(address(this), ATTACK_VALUE);

            // Simulate CCIP message through MockRouter
            router.simulateMessageReceived(
                address(messenger),
                138, // DEFI_ORACLE_META_SELECTOR
                address(this),
                data
            );

            emit AttackAttempted(ATTACK_VALUE, attackCount);
        }
    }

    function attack() external payable {
        require(msg.value >= ATTACK_VALUE + FEE_BUFFER, "Need at least 1.1 ETH");
        attackCount = 0;
        messenger.sendToPolygon{value: msg.value}(address(this));
        emit AttackAttempted(msg.value, 0);
    }
}
