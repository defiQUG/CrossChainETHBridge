// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IWETH} from "./interfaces/IWETH.sol";
import {EmergencyPause} from "./security/EmergencyPause.sol";
import {SecurityBase} from "./security/SecurityBase.sol";
import {ICrossChainMessenger} from "./interfaces/ICrossChainMessenger.sol";
import {CrossChainErrors} from "./errors/CrossChainErrors.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CrossChainMessenger is
    SecurityBase,
    ICrossChainMessenger,
    ReentrancyGuard
{
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

    event MessageSent(
        bytes32 indexed messageId,
        address indexed sender,
        address indexed recipient,
        uint256 amount
    );
    event MessageReceived(
        bytes32 indexed messageId,
        address indexed sender,
        uint256 amount
    );
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
        if (router == address(0)) revert CrossChainErrors.InvalidRouter(router);
        if (weth == address(0)) revert CrossChainErrors.InvalidTokenAddress(weth);
        if (_emergencyPause == address(0)) revert CrossChainErrors.InvalidReceiver(address(0));
        if (initialFee > maxFee) revert CrossChainErrors.InvalidFeeAmount(maxFee, initialFee);

        ROUTER = IRouterClient(router);
        WETH = IWETH(weth);
        emergencyPause = EmergencyPause(_emergencyPause);
        _bridgeFee = initialFee;
    }

    constructor(
        address router,
        address weth,
        address _emergencyPause,
        uint256 initialFee,
        uint256 maxFee,
        uint256 maxMessages,
        uint256 periodDuration
    ) SecurityBase(maxMessages, periodDuration) {
        if (router == address(0)) revert CrossChainErrors.InvalidRouter(router);
        if (weth == address(0)) revert CrossChainErrors.InvalidTokenAddress(weth);
        if (_emergencyPause == address(0)) revert CrossChainErrors.InvalidReceiver(address(0));
        if (initialFee > maxFee) revert CrossChainErrors.InvalidFeeAmount(maxFee, initialFee);

        ROUTER = IRouterClient(router);
        WETH = IWETH(weth);
        emergencyPause = EmergencyPause(_emergencyPause);
        _bridgeFee = initialFee;

        // Effects before interactions
        bool messageProcessed = processMessage();
        if (!messageProcessed) revert CrossChainErrors.RateLimitExceeded(getLimit(), amount);

        // Interactions
        try WETH.deposit{value: amount}() {
            Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
                receiver: abi.encode(_recipient),
                data: abi.encode(_recipient, amount),
                tokenAmounts: new Client.EVMTokenAmount[](0),
                extraArgs: "",
                feeToken: address(0)
            });

            bytes32 messageId = ROUTER.ccipSend{value: _bridgeFee}(
                POLYGON_CHAIN_SELECTOR,
                message
            );
            emit MessageSent(messageId, msg.sender, _recipient, amount);
        } catch {
            revert CrossChainErrors.TransferFailed();
        }
    }

    function ccipReceive(
        Client.Any2EVMMessage memory message
    ) external nonReentrant {
        if (emergencyPause.paused()) revert CrossChainErrors.EmergencyPaused();
        if (
            message.sourceChainSelector != DEFI_ORACLE_META_CHAIN_SELECTOR &&
            message.sourceChainSelector != POLYGON_CHAIN_SELECTOR
        ) {
            revert CrossChainErrors.InvalidSourceChain(message.sourceChainSelector);
        }
        if (_processedMessages[message.messageId])
            revert CrossChainErrors.MessageAlreadyProcessed(message.messageId);

        if (message.data.length != 64) revert CrossChainErrors.InvalidMessageLength();
        (address recipient, uint256 amount) = abi.decode(
            message.data,
            (address, uint256)
        );
        if (recipient == address(0)) revert CrossChainErrors.InvalidReceiver(recipient);
        if (amount == 0) revert CrossChainErrors.InvalidAmount(amount);

        if (message.destTokenAmounts.length > 0) {
            bool validTokenFound = false;
            for (uint256 i = 0; i < message.destTokenAmounts.length; i++) {
                if (message.destTokenAmounts[i].token == address(WETH)) {
                    if (message.destTokenAmounts[i].amount != amount)
                        revert CrossChainErrors.InvalidAmount(message.destTokenAmounts[i].amount);
                    validTokenFound = true;
                    break;
                }
            }
            if (!validTokenFound) revert CrossChainErrors.InvalidTokenAddress(address(WETH));
        }

        // Effects before interactions
        _processedMessages[message.messageId] = true;
        bool messageProcessed = processMessage();
        if (!messageProcessed) revert CrossChainErrors.RateLimitExceeded(getMaxMessagesPerPeriod(), amount);

        // Interactions
        WETH.withdraw(amount);
        (bool success, ) = recipient.call{value: amount}("");
        if (!success) revert CrossChainErrors.TransferFailed();

        emit MessageReceived(message.messageId, recipient, amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setBridgeFee(uint256 _newFee) external onlyOwner {
        if (_newFee > MAX_FEE) revert CrossChainErrors.InvalidFeeAmount(MAX_FEE, _newFee);
        _bridgeFee = _newFee;
        emit BridgeFeeUpdated(_newFee);
    }

    function emergencyWithdraw(
        address _recipient
    ) external onlyOwner nonReentrant {
        if (_recipient == address(0)) revert CrossChainErrors.InvalidReceiver(_recipient);
        if (!emergencyPause.paused()) revert CrossChainErrors.EmergencyPaused();

        uint256 wethBalance = WETH.balanceOf(address(this));
        uint256 ethBalance = address(this).balance;
        uint256 totalBalance = wethBalance + ethBalance;

        if (totalBalance == 0) revert CrossChainErrors.InsufficientBalance(1, totalBalance);

        // Effects before interactions - none needed for this function

        // Interactions
        if (wethBalance > 0) {
            WETH.withdraw(wethBalance);
        }

        (bool success, ) = _recipient.call{value: totalBalance}("");
        if (!success) revert CrossChainErrors.TransferFailed();

        emit EmergencyWithdraw(_recipient, totalBalance);
    }

    function getBridgeFee() external view returns (uint256) {
        return _bridgeFee;
    }

    receive() external payable {}
}
