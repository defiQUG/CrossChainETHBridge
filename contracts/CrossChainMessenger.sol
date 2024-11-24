// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { IWETH } from "./interfaces/IWETH.sol";
import { EmergencyPause } from "./security/EmergencyPause.sol";
import { RateLimiter } from "./security/RateLimiter.sol";

error TransferFailed();
error InsufficientBalance();
error InvalidRecipient();

contract CrossChainMessenger {
    IRouterClient public immutable ROUTER;
    IWETH public immutable WETH;
    RateLimiter public immutable rateLimiter;
    EmergencyPause public immutable emergencyPause;
    uint256 private _bridgeFee;

    event MessageSent(address indexed sender, address indexed recipient, uint256 amount);
    event BridgeFeeUpdated(uint256 newFee);
    event EmergencyWithdrawal(address indexed recipient, uint256 amount);

    constructor(
        address router,
        address weth,
        address _rateLimiter,
        address _emergencyPause
    ) {
        if (router == address(0)) revert InvalidRecipient();
        if (weth == address(0)) revert InvalidRecipient();
        if (_rateLimiter == address(0)) revert InvalidRecipient();
        if (_emergencyPause == address(0)) revert InvalidRecipient();

        ROUTER = IRouterClient(router);
        WETH = IWETH(weth);
        rateLimiter = RateLimiter(_rateLimiter);
        emergencyPause = EmergencyPause(_emergencyPause);
    }

    function sendToPolygon(address _recipient) external payable {
        if (_recipient == address(0)) revert InvalidRecipient();
        if (msg.value <= _bridgeFee) revert InsufficientBalance();

        bool success = rateLimiter.processMessage();
        require(success, "RateLimiter: Message processing failed");

        uint256 amount = msg.value - _bridgeFee;
        WETH.deposit{value: amount}();

        emit MessageSent(msg.sender, _recipient, amount);
    }

    function setBridgeFee(uint256 _newFee) external {
        _bridgeFee = _newFee;
        emit BridgeFeeUpdated(_newFee);
    }

    function emergencyWithdraw(address _recipient) external {
        if (_recipient == address(0)) revert InvalidRecipient();

        uint256 balance = address(this).balance;
        if (balance == 0) revert InsufficientBalance();

        (bool success,) = _recipient.call{value: balance}("");
        if (!success) revert TransferFailed();

        emit EmergencyWithdrawal(_recipient, balance);
    }

    receive() external payable {}
}
