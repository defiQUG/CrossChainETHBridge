// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library CrossChainErrors {
    // Security Errors
    error Unauthorized();
    error ReentrantCall();
    error InvalidChainId(uint64 chainId);
    error InvalidSourceChain(uint64 sourceChain);
    error InvalidDestinationChain(uint64 destinationChain);
    error InvalidTokenAddress(address token);
    error InvalidAmount(uint256 amount);
    error InsufficientBalance(uint256 required, uint256 available);
    error MessageAlreadyProcessed(bytes32 messageId);
    error InvalidMessageLength();
    error InvalidMessageFormat();
    error TransferFailed();
    error EmergencyPaused();
    error RateLimitExceeded(uint256 limit, uint256 requested);
    error InvalidFeeAmount(uint256 expected, uint256 received);
    error InvalidRouter(address router);
    error InvalidReceiver(address receiver);
}
