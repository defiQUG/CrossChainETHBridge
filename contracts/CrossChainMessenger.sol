// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { IWETH } from "./interfaces/IWETH.sol";
import { EmergencyPause } from "./security/EmergencyPause.sol";
import { SecurityBase } from "./security/SecurityBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error TransferFailed();
error InsufficientBalance();
error InvalidRecipient();
error FeeExceedsMaximum();
error InvalidSourceChain();
error InvalidMessageFormat();

contract CrossChainMessenger is Ownable {
    using Client for Client.Any2EVMMessage;

    IRouterClient public immutable ROUTER;
    IWETH public immutable WETH;
    SecurityBase public immutable security;
    EmergencyPause public immutable emergencyPause;
    uint256 private _bridgeFee;
    uint256 public immutable MAX_FEE;
    uint64 public constant POLYGON_CHAIN_SELECTOR = 137;

    event MessageSent(address indexed sender, address indexed recipient, uint256 amount);
    event MessageReceived(bytes32 indexed messageId, address indexed sender, uint256 amount);
    event BridgeFeeUpdated(uint256 newFee);
    event EmergencyWithdrawal(address indexed recipient, uint256 amount);

    constructor(
        address router,
        address payable weth,
        address _security,
        address _emergencyPause,
        uint256 initialFee,
        uint256 maxFee
    ) {
        if (router == address(0)) revert InvalidRecipient();
        if (weth == address(0)) revert InvalidRecipient();
        if (_security == address(0)) revert InvalidRecipient();
        if (_emergencyPause == address(0)) revert InvalidRecipient();
        if (initialFee > maxFee) revert FeeExceedsMaximum();

        ROUTER = IRouterClient(router);
        WETH = IWETH(weth);
        security = SecurityBase(_security);
        emergencyPause = EmergencyPause(_emergencyPause);
        _bridgeFee = initialFee;
        MAX_FEE = maxFee;
    }

    function sendToPolygon(address _recipient) external payable {
        if (_recipient == address(0)) revert InvalidRecipient();
        if (msg.value <= _bridgeFee) revert InsufficientBalance();
        require(!emergencyPause.paused(), "EmergencyPause: contract is paused");

        bool success = security.processMessage();
        require(success, "SecurityBase: Message processing failed");

        uint256 amount = msg.value - _bridgeFee;
        WETH.deposit{value: amount}();

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(_recipient),
            data: abi.encode(amount),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: "",
            feeToken: address(0)
        });

        bytes32 messageId = ROUTER.ccipSend(POLYGON_CHAIN_SELECTOR, message);
        emit MessageSent(msg.sender, _recipient, amount);
    }

    function ccipReceive(Client.Any2EVMMessage memory message) external {
        require(!emergencyPause.paused(), "EmergencyPause: contract is paused");
        if (message.sourceChainSelector != POLYGON_CHAIN_SELECTOR) revert InvalidSourceChain();

        bool success = security.processMessage();
        require(success, "SecurityBase: Message processing failed");

        (address recipient, uint256 amount) = abi.decode(message.data, (address, uint256));
        if (recipient == address(0)) revert InvalidRecipient();

        (bool sent,) = recipient.call{value: amount}("");
        if (!sent) revert TransferFailed();

        emit MessageReceived(message.messageId, recipient, amount);
    }

    function setBridgeFee(uint256 _newFee) external onlyOwner {
        if (_newFee > MAX_FEE) revert FeeExceedsMaximum();
        _bridgeFee = _newFee;
        emit BridgeFeeUpdated(_newFee);
    }

    function emergencyWithdraw(address _recipient) external onlyOwner {
        if (_recipient == address(0)) revert InvalidRecipient();
        require(emergencyPause.paused(), "EmergencyPause: contract not paused");

        uint256 balance = address(this).balance;
        if (balance == 0) revert InsufficientBalance();

        (bool success,) = _recipient.call{value: balance}("");
        if (!success) revert TransferFailed();

        emit EmergencyWithdrawal(_recipient, balance);
    }

    function getBridgeFee() external view returns (uint256) {
        return _bridgeFee;
    }

    receive() external payable {}
}
