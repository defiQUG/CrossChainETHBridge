// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/security/Pausable.sol";
import { ISecurityBase } from "../interfaces/ISecurityBase.sol";

contract SecurityBase is ISecurityBase, Ownable, Pausable {
    uint256 public constant messageCount = 0;

    function processMessage() public virtual override returns (bool) {
        emit MessageProcessed(msg.sender, block.timestamp);
        return true;
    }
}
