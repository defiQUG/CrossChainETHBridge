// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./MockRouter.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";

// Chain selectors for supported networks
uint64 constant DEFI_ORACLE_META_CHAIN_SELECTOR = 138;
uint64 constant POLYGON_CHAIN_SELECTOR = 137;

contract TestRouter is MockRouter, IRouterClient {
    mapping(address => bool) public testSupportedTokens;

    // Adjusted gas fees for different networks
    uint256 private constant BASE_FEE = 0.6 ether; // Base fee adjusted to 0.6 ETH to match test expectations
    uint256 private constant GAS_PRICE_MULTIPLIER = 110; // 10% buffer for gas price fluctuations
    uint256 private constant MIN_GAS_LIMIT = 21000; // Minimum gas required for basic transaction

    // Network-specific gas multipliers (base 100)
    mapping(uint64 => uint256) private chainGasMultipliers;

    // Events for state changes
    event ChainSupportUpdated(uint64 indexed chainSelector, bool supported);
    event TokenSupportUpdated(address indexed token, bool supported);
    event ExtraFeeUpdated(uint256 newFee);

    constructor(uint256 maxMessages, uint256 periodDuration) MockRouter(maxMessages, periodDuration) {
        // Initialize supported chains
        _supportedChains[DEFI_ORACLE_META_CHAIN_SELECTOR] = true;
        _supportedChains[POLYGON_CHAIN_SELECTOR] = true;

        // Initialize gas multipliers for different chains
        chainGasMultipliers[DEFI_ORACLE_META_CHAIN_SELECTOR] = 120; // 20% higher for Defi Oracle Meta
        chainGasMultipliers[POLYGON_CHAIN_SELECTOR] = 80;  // 20% lower for Polygon
    }

    function initialize(
        address admin,
        address feeToken,
        uint256 baseFee
    ) public override {
        // Call parent initialize only if not already initialized
        if (!_routerInitialized) {
            super.initialize(admin, feeToken, baseFee);
        }
    }

    function isChainSupported(uint64 destChainSelector) external view override returns (bool) {
        return _supportedChains[destChainSelector];
    }

    function ccipSend(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) external payable override(IRouterClient, MockRouter) returns (bytes32) {
        require(_supportedChains[destinationChainSelector], "Chain not supported");
        uint256 requiredFee = getFee(destinationChainSelector, message);
        require(msg.value >= requiredFee, "Insufficient fee");
        require(message.tokenAmounts.length == 0, "TestRouter: token transfers not supported");

        bytes32 messageId = keccak256(abi.encode(
            block.timestamp,
            msg.sender,
            destinationChainSelector,
            message
        ));

        emit MessageSent(messageId, destinationChainSelector, message);
        return messageId;
    }

    function getFee(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) public view override(MockRouter, IRouterClient) returns (uint256) {
        require(_supportedChains[destinationChainSelector], "Chain not supported");

        // Calculate dynamic fee based on chain and message size
        uint256 baseGasFee = BASE_FEE;
        uint256 chainMultiplier = chainGasMultipliers[destinationChainSelector];
        uint256 messageGas = MIN_GAS_LIMIT + (message.data.length * 68); // 68 gas per byte of data

        // Simplified fee calculation to match test expectations
        uint256 totalFee = baseGasFee;

        // Add chain-specific multiplier
        if (chainMultiplier != 100) {
            totalFee = (totalFee * chainMultiplier) / 100;
        }

        // Add message size cost
        uint256 messageSizeFee = (messageGas * tx.gasprice * chainMultiplier) / 100;
        totalFee += messageSizeFee;

        return totalFee + _extraFee;
    }

    function validateMessage(Client.Any2EVMMessage memory message) public pure override returns (bool) {
        if (message.messageId == bytes32(0)) revert("TestRouter: invalid message");
        if (message.sourceChainSelector == 0) revert("Chain not supported");
        if (message.sender.length == 0) revert("Invalid sender length");
        if (message.data.length == 0) revert("TestRouter: invalid message");
        if (message.destTokenAmounts.length > 0) revert("TestRouter: token transfers not supported");
        return true;
    }

    function routeMessage(
        Client.Any2EVMMessage calldata message,
        uint16 gasForCallExactCheck,
        uint256 gasLimit,
        address receiver
    ) external override returns (bool success, bytes memory retBytes, uint256 gasUsed) {
        require(_supportedChains[message.sourceChainSelector], "Chain not supported");
        require(validateMessage(message), "TestRouter: invalid message");
        require(processMessage(), "Rate limit exceeded");

        uint256 startGas = gasleft();
        require(gasLimit <= startGas, "Gas limit exceeded");

        (success, retBytes) = receiver.call{gas: gasLimit}(message.data);
        gasUsed = startGas - gasleft();

        if (success && gasForCallExactCheck > 0) {
            require(gasUsed <= gasLimit, "Gas limit exceeded");
        }

        emit MessageReceived(message.messageId, message.sourceChainSelector, message);
        return (success, retBytes, gasUsed);
    }

    function simulateMessageReceived(
        address target,
        Client.Any2EVMMessage memory message
    ) external override whenNotPaused payable {
        require(target != address(0), "Invalid target address");
        require(_supportedChains[message.sourceChainSelector], "Chain not supported");
        require(validateMessage(message), "TestRouter: invalid message");
        require(processMessage(), "Rate limit exceeded");

        // Validate target contract exists
        uint256 size;
        assembly {
            size := extcodesize(target)
        }
        require(size > 0, "Target contract does not exist");

        bytes32 messageId = keccak256(abi.encode(
            message.messageId,
            target,
            message.sourceChainSelector,
            message.data,
            msg.value
        ));
        emit MessageSimulated(target, messageId, msg.value);

        // Calculate safe gas limit
        uint256 gasLimit = gasleft() - 2000; // Reserve 2000 gas for post-call operations

        (bool success, bytes memory result) = target.call{
            gas: gasLimit,
            value: msg.value
        }(message.data);

        if (!success) {
            assembly {
                revert(add(32, result), mload(result))
            }
        }
    }

    function setSupportedChain(uint64 chainSelector, bool supported) external onlyOwner {
        _supportedChains[chainSelector] = supported;
        emit ChainSupportUpdated(chainSelector, supported);
    }

    function setSupportedTokens(address token, bool supported) external override onlyOwner {
        testSupportedTokens[token] = supported;
        emit TokenSupportUpdated(token, supported);
    }

    function setExtraFee(uint256 newExtraFee) external onlyOwner {
        _extraFee = newExtraFee;
        emit ExtraFeeUpdated(newExtraFee);
    }

    function shouldResetPeriod() external view returns (bool) {
        uint256 timeLeft = this.getTimeUntilReset();
        return timeLeft == 0;
    }

    function setFeeConfig(address admin, address feeToken, uint256 baseFee) external onlyOwner {
        _admin = admin;
        _feeToken = feeToken;
        _baseFee = baseFee;
    }

    receive() external payable override {}
}
