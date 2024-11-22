// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../CrossChainMessenger.sol";

contract ReentrancyAttacker {
    CrossChainMessenger public messenger;
    uint256 public attackCount;
    uint256 public constant ATTACK_VALUE = 1 ether;
    uint256 public constant MIN_BALANCE = 2 ether;

    event AttackAttempted(uint256 value, uint256 count);
    event ReentrancyCallFailed(string reason);
    event FallbackCalled(uint256 balance, uint256 count);

    constructor(address payable _messenger) {
        require(_messenger != address(0), "Invalid messenger address");
        messenger = CrossChainMessenger(_messenger);
    }

    function attack() external payable {
        require(msg.value >= MIN_BALANCE, "Need at least 2 ETH");
        attackCount = 0;

        // Initial call to trigger reentrancy
        try messenger.sendToPolygon{value: ATTACK_VALUE, gas: 500000}(address(this)) {
            emit AttackAttempted(ATTACK_VALUE, 0);
        } catch Error(string memory reason) {
            emit ReentrancyCallFailed(reason);
            revert(reason);
        } catch (bytes memory reason) {
            string memory decodedReason = _getRevertMsg(reason);
            emit ReentrancyCallFailed(decodedReason);
            revert(decodedReason);
        }
    }

    // Fallback function that attempts reentry
    receive() external payable {
        // Don't increment counter until after successful call
        uint256 currentCount = attackCount;

        if (currentCount < 1 && address(this).balance >= ATTACK_VALUE) {
            emit FallbackCalled(address(this).balance, currentCount);

            // Try to reenter during message processing
            try messenger.sendToPolygon{value: ATTACK_VALUE, gas: 500000}(address(this)) {
                attackCount = currentCount + 1;
                emit AttackAttempted(ATTACK_VALUE, attackCount);
            } catch Error(string memory reason) {
                emit ReentrancyCallFailed(reason);
                revert(reason);
            } catch (bytes memory reason) {
                string memory decodedReason = _getRevertMsg(reason);
                emit ReentrancyCallFailed(decodedReason);
                revert(decodedReason);
            }
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
