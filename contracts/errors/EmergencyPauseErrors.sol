// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library EmergencyPauseErrors {
    error ContractPaused();
    error InvalidPauseThreshold();
    error InvalidPauseDuration();
    error InsufficientLockedValue();
    error ContractNotPaused();
    error AmountExceedsLockedValue();
}
