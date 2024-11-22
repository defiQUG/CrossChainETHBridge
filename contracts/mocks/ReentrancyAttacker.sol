// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../CrossChainMessenger.sol";
import "./MockRouter.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IAny2EVMMessageReceiver.sol";

contract ReentrancyAttacker is IAny2EVMMessageReceiver {
    CrossChainMessenger public messenger;
    MockRouter public router;
    uint256 public attackCount;
    uint256 public constant ATTACK_VALUE = 1 ether;
    uint256 public constant FEE_BUFFER = 0.1 ether;

    event AttackAttempted(uint256 value, uint256 count);
    event FallbackCalled(uint256 value);
    event MessageReceived(bytes32 messageId);

    constructor(address payable _messenger, address payable _router) payable {
        require(_messenger != address(0), "Invalid messenger address");
        require(_router != address(0), "Invalid router address");
        require(msg.value >= ATTACK_VALUE + FEE_BUFFER, "Insufficient initial ETH");
        messenger = CrossChainMessenger(_messenger);
        router = MockRouter(_router);
    }

    receive() external payable {
        emit FallbackCalled(msg.value);
    }

    function ccipReceive(Client.Any2EVMMessage memory message) external override {
        emit MessageReceived(message.messageId);

        if (attackCount < 2) {
            attackCount++;
            // Attempt reentrancy - this should revert
            messenger.sendToPolygon{value: ATTACK_VALUE}(address(this));
            emit AttackAttempted(ATTACK_VALUE, attackCount);
        }
    }

    function attack() external payable {
        require(address(this).balance >= ATTACK_VALUE, "Insufficient contract balance");
        attackCount = 0;
        messenger.sendToPolygon{value: ATTACK_VALUE}(address(this));
        emit AttackAttempted(ATTACK_VALUE, 0);
    }
}
