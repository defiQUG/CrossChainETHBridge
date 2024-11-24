// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";

interface ICrossChainMessenger {
    function sendToPolygon(address _recipient) external payable;
    function ccipReceive(Client.Any2EVMMessage memory message) external;
    function pause() external;
    function unpause() external;
    function setBridgeFee(uint256 _newFee) external;
    function emergencyWithdraw(address _recipient) external;
    function getBridgeFee() external view returns (uint256);
}
