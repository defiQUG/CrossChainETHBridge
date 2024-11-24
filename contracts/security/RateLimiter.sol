// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IRateLimiter} from "../interfaces/IRateLimiter.sol";
import {SecurityBase} from "./SecurityBase.sol";

contract RateLimiter is SecurityBase {
    constructor(
        uint256 maxMessages,
        uint256 periodDuration
    )
        SecurityBase(
            maxMessages == 0 ? 1000 : maxMessages,
            periodDuration == 0 ? 3600 : periodDuration
        )
    {}
}
