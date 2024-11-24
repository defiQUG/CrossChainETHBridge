// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { IRateLimiter } from "./IRateLimiter.sol";

/**
 * @title ISecurityBase
 * @dev This interface combines security-related interfaces (currently only IRateLimiter)
 * to provide a single interface for security features. It intentionally contains no
 * additional function declarations as all required functionality is inherited from
 * the imported interfaces.
 */
interface ISecurityBase is IRateLimiter {
    // All required functions are inherited from IRateLimiter
}
