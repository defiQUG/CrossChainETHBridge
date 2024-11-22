// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../CrossChainMessenger.sol";

contract ReentrancyAttacker {
    CrossChainMessenger public messenger;
    uint256 public attackCount;
    uint256 public constant ATTACK_VALUE = 1 ether;
    uint256 public constant MIN_BALANCE = 2 ether;
    uint256 public constant GAS_LIMIT = 500000;

    event AttackAttempted(uint256 value, uint256 count);
    event ReentrancyCallFailed(string reason);
    event FallbackCalled(uint256 balance, uint256 count);

    constructor(address payable _messenger) {
        require(_messenger != address(0), "Invalid messenger address");
        messenger = CrossChainMessenger(_messenger);
    }

    function attackWithGas() external payable {
        require(msg.value >= MIN_BALANCE, "Need at least 2 ETH");
        attackCount = 0;

        // Initial call with fixed gas limit
        (bool success, bytes memory data) = address(messenger).call{
            value: ATTACK_VALUE,
            gas: GAS_LIMIT
        }(abi.encodeWithSelector(messenger.sendToPolygon.selector, address(this)));

        if (!success) {
            string memory reason = _getRevertMsg(data);
            emit ReentrancyCallFailed(reason);
            revert(reason);
        }

        emit AttackAttempted(ATTACK_VALUE, 0);
    }

    receive() external payable {
        uint256 currentCount = attackCount;

        if (currentCount < 1 && address(this).balance >= ATTACK_VALUE) {
            emit FallbackCalled(address(this).balance, currentCount);

            (bool success, bytes memory data) = address(messenger).call{
                value: ATTACK_VALUE,
                gas: GAS_LIMIT
            }(abi.encodeWithSelector(messenger.sendToPolygon.selector, address(this)));

            if (!success) {
                string memory reason = _getRevertMsg(data);
                emit ReentrancyCallFailed(reason);
                revert(reason);
            }

            attackCount = currentCount + 1;
            emit AttackAttempted(ATTACK_VALUE, attackCount);
        }
    }

    // Helper function to extract revert reason
    function _getRevertMsg(bytes memory _returnData) internal pure returns (string memory) {
        // If the _returnData length is less than 68, then the transaction failed silently (without a revert message)
        if (_returnData.length < 68) return "Transaction reverted silently";
        assembly {
            // Slice the sighash of the revert statement
            _returnData := add(_returnData, 0x04)
        }
        return abi.decode(_returnData, (string));
    }
}
