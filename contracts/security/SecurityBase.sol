// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/security/Pausable.sol";

contract SecurityBase is Ownable, Pausable {
    event MessageProcessed(address indexed sender, uint256 timestamp);

    function processMessage() public virtual returns (bool) {
        return true;
    }
}
