// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { IWETH } from "./interfaces/IWETH.sol";
import { EmergencyPause } from "./security/EmergencyPause.sol";
import { SecurityBase } from "./security/SecurityBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

error TransferFailed();
error InsufficientPayment();
error InvalidRecipient();
error FeeExceedsMaximum();
error InvalidSourceChain();
error InvalidMessageFormat();
error ZeroAmount();
error InvalidTokenAmount();
error MessageAlreadyProcessed();

contract CrossChainMessenger is SecurityBase, Pausable {
    using Client for Client.Any2EVMMessage;
    using Client for Client.EVM2AnyMessage;

    IRouterClient public immutable ROUTER;
    IWETH public immutable WETH;
    EmergencyPause public immutable emergencyPause;
    uint256 private _bridgeFee;
    uint256 public immutable MAX_FEE;
    uint64 public constant POLYGON_CHAIN_SELECTOR = 137;
    uint64 public constant DEFI_ORACLE_META_CHAIN_SELECTOR = 138;
    mapping(bytes32 => bool) private _processedMessages;

    event MessageSent(bytes32 indexed messageId, address indexed sender, address indexed recipient, uint256 amount);
    event MessageReceived(bytes32 indexed messageId, address indexed sender, uint256 amount);
    event BridgeFeeUpdated(uint256 newFee);
    event EmergencyWithdraw(address indexed recipient, uint256 amount);

    constructor(
        address router,
        address payable weth,
        address _security,
        address _emergencyPause,
        uint256 initialFee,
        uint256 maxFee
    ) SecurityBase(100, 3600) {
        if (router == address(0)) revert InvalidRecipient();
        if (weth == address(0)) revert InvalidRecipient();
        if (_emergencyPause == address(0)) revert InvalidRecipient();
        if (initialFee > maxFee) revert FeeExceedsMaximum();

        ROUTER = IRouterClient(router);
        WETH = IWETH(weth);
        emergencyPause = EmergencyPause(_emergencyPause);
        _bridgeFee = initialFee;
        MAX_FEE = maxFee;
    }

    function sendToPolygon(address _recipient) external payable {
        if (_recipient == address(0)) revert InvalidRecipient();
        if (msg.value <= _bridgeFee) revert InsufficientPayment();
        if (paused()) revert("CrossChainMessenger: contract is paused");

        uint256 amount = msg.value - _bridgeFee;
        if (amount == 0) revert ZeroAmount();

        if (amount >= emergencyPause.pauseThreshold()) {
            if (emergencyPause.checkAndUpdateValue(amount)) {
                revert("EmergencyPause: threshold exceeded");
            }
        }

        if (!processMessage()) revert("RateLimiter: rate limit exceeded");

        try WETH.deposit{value: amount}() {
            Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
                receiver: abi.encode(_recipient),
                data: abi.encode(_recipient, amount),
                tokenAmounts: new Client.EVMTokenAmount[](0),
                extraArgs: "",
                feeToken: address(0)
            });

            bytes32 messageId = ROUTER.ccipSend{value: _bridgeFee}(POLYGON_CHAIN_SELECTOR, message);
            emit MessageSent(messageId, msg.sender, _recipient, amount);
        } catch {
            revert("CrossChainMessenger: WETH deposit failed");
        }
    }

    function ccipReceive(Client.Any2EVMMessage memory message) external {
        if (emergencyPause.paused()) revert("EmergencyPause: contract is paused");
        if (message.sourceChainSelector != DEFI_ORACLE_META_CHAIN_SELECTOR) revert InvalidSourceChain();
        if (_processedMessages[message.messageId]) revert MessageAlreadyProcessed();
        if (!processMessage()) revert("RateLimiter: rate limit exceeded");

        if (message.data.length != 64) revert InvalidMessageFormat();
        (address recipient, uint256 amount) = abi.decode(message.data, (address, uint256));
        if (recipient == address(0)) revert InvalidRecipient();
        if (amount == 0) revert ZeroAmount();

        if (message.destTokenAmounts.length > 0) {
            bool validTokenFound = false;
            for (uint256 i = 0; i < message.destTokenAmounts.length; i++) {
                if (message.destTokenAmounts[i].token == address(WETH)) {
                    if (message.destTokenAmounts[i].amount != amount) revert InvalidTokenAmount();
                    validTokenFound = true;
                    break;
                }
            }
            if (!validTokenFound) revert InvalidTokenAmount();
        }

        _processedMessages[message.messageId] = true;

        WETH.withdraw(amount);
        (bool success,) = recipient.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit MessageReceived(message.messageId, recipient, amount);
    }

    function setBridgeFee(uint256 _newFee) external onlyOwner {
        if (_newFee > MAX_FEE) revert FeeExceedsMaximum();
        _bridgeFee = _newFee;
        emit BridgeFeeUpdated(_newFee);
    }

    function emergencyWithdraw(address _recipient) external onlyOwner {
        if (_recipient == address(0)) revert InvalidRecipient();
        if (!emergencyPause.paused()) revert("EmergencyPause: contract not paused");

        uint256 wethBalance = WETH.balanceOf(address(this));
        uint256 ethBalance = address(this).balance;
        uint256 totalBalance = wethBalance + ethBalance;

        if (totalBalance == 0) revert InsufficientBalance();

        if (wethBalance > 0) {
            WETH.withdraw(wethBalance);
        }

        (bool success,) = _recipient.call{value: totalBalance}("");
        if (!success) revert TransferFailed();

        emit EmergencyWithdraw(_recipient, totalBalance);
    }

    function getBridgeFee() external view returns (uint256) {
        return _bridgeFee;
    }

    receive() external payable {}
}
