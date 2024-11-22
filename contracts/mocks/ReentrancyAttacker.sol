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

    constructor(address payable _messenger, address _router) {
        messenger = CrossChainMessenger(_messenger);
        router = MockRouter(_router);
        initialized = true;
    }

    receive() external payable {
        require(initialized, "Contract not initialized");
        if (attackCount < 2 && address(this).balance >= ATTACK_VALUE) {
            attackCount++;
            // Try to reenter through sendToPolygon
            messenger.sendToPolygon{value: ATTACK_VALUE}(address(this));

            // Also try to reenter through _ccipReceive
            bytes memory messageData = abi.encode(address(this), ATTACK_VALUE);
            router.simulateMessageReceived(
                address(messenger),
                138, // DEFI_ORACLE_META_SELECTOR
                address(router),
                messageData
            );
        }
    }

    function attack() external payable {
        require(initialized, "Contract not initialized");
        require(msg.value >= ATTACK_VALUE, "Need at least 1 ETH");
        attackCount = 0;
        messenger.sendToPolygon{value: ATTACK_VALUE}(address(this));
    }
}
