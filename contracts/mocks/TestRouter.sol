// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./MockRouter.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";

// Chain selectors for supported networks
uint64 constant DEFI_ORACLE_META_CHAIN_SELECTOR = 138;
uint64 constant POLYGON_CHAIN_SELECTOR = 137;

contract TestRouter is MockRouter, IRouterClient {
    mapping(address => bool) public testSupportedTokens;

    // Fixed gas fees for test expectations
    uint256 private constant EXTRA_FEE = 500000000000000000; // Exact 0.5 ETH for extra fee tests
    uint256 private constant MESSAGE_SIZE_FEE = 1000000000000000; // 0.001 ETH per byte for large messages

    // Network-specific gas multipliers (base 100)
    mapping(uint64 => uint256) private chainGasMultipliers;

    // Events for state changes
    event ChainSupportUpdated(uint64 indexed chainSelector, bool supported);
    event TokenSupportUpdated(address indexed token, bool supported);
    event ExtraFeeUpdated(uint256 newFee);

    constructor(uint256 maxMessages, uint256 periodDuration) MockRouter(maxMessages, periodDuration) {
        _supportedChains[DEFI_ORACLE_META_CHAIN_SELECTOR] = true;
        _supportedChains[POLYGON_CHAIN_SELECTOR] = true;
    }

    function initialize(
        address admin,
        address feeToken,
        uint256 _baseFee
    ) public override {
        if (!_routerInitialized) {
            super.initialize(admin, feeToken, _baseFee);
            _extraFee = EXTRA_FEE; // Set 0.5 ETH as extra fee during initialization
        }
    }

    function isChainSupported(uint64 destChainSelector) external view override returns (bool) {
        return _supportedChains[destChainSelector];
    }

    function getFee(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) public view override(MockRouter, IRouterClient) returns (uint256) {
        if (destinationChainSelector == 0) {
            revert("TestRouter: invalid chain selector");
        }
        if (!_supportedChains[destinationChainSelector]) {
            revert("TestRouter: chain not supported");
        }
        // Base fee is always included
        uint256 totalFee = baseFee;
        // Add extra fee if message has extra args
        if (message.extraArgs.length > 0) {
            totalFee += _extraFee; // Use _extraFee from parent contract instead of constant
        }
        return totalFee;
    }

    function ccipSend(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) external payable override(IRouterClient, MockRouter) returns (bytes32) {
        if (destinationChainSelector == 0) {
            revert("TestRouter: invalid chain selector");
        }
        if (!_supportedChains[destinationChainSelector]) {
            revert("TestRouter: chain not supported");
        }
        uint256 requiredFee = getFee(destinationChainSelector, message);
        if (msg.value < requiredFee) {
            revert("TestRouter: insufficient fee");
        }
        require(processMessage(), "TestRouter: rate limit exceeded");

        bytes32 messageId = keccak256(abi.encode(block.timestamp, message, msg.sender));
        emit MessageSent(messageId, destinationChainSelector, message);

        return messageId;
    }

    function routeMessage(
        Client.Any2EVMMessage calldata message,
        uint16 gasForCallExactCheck,
        uint256 gasLimit,
        address receiver
    ) external override returns (bool success, bytes memory retBytes, uint256 gasUsed) {
        if (!_supportedChains[message.sourceChainSelector]) {
            revert("TestRouter: chain not supported");
        }
        require(validateMessage(message), "TestRouter: invalid message");
        require(processMessage(), "TestRouter: rate limit exceeded");

        uint256 startGas = gasleft();
        (success, retBytes) = receiver.call{gas: gasLimit}(message.data);
        gasUsed = startGas - gasleft();

        if (success && gasForCallExactCheck > 0) {
            require(gasUsed <= gasLimit, "TestRouter: gas limit exceeded");
        }

        emit MessageReceived(message.messageId, message.sourceChainSelector, message);
        return (success, retBytes, gasUsed);
    }

    function validateMessage(Client.Any2EVMMessage memory message) public pure override returns (bool) {
        if (message.messageId == bytes32(0)) {
            revert("TestRouter: invalid message ID");
        }
        if (message.sourceChainSelector == 0) {
            revert("TestRouter: invalid chain selector");
        }
        if (message.sender.length == 0) {
            revert("TestRouter: invalid sender");
        }
        if (message.data.length == 0) {
            revert("TestRouter: invalid message");
        }
        if (message.destTokenAmounts.length > 0) {
            revert("TestRouter: token transfers not supported");
        }
        return true;
    }

    function simulateMessageReceived(
        address target,
        Client.Any2EVMMessage memory message
    ) external override whenNotPaused payable {
        require(target != address(0), "TestRouter: invalid target");
        require(validateMessage(message), "TestRouter: invalid message");
        require(processMessage(), "TestRouter: rate limit exceeded");

        bytes32 messageId = keccak256(abi.encode(message));
        emit MessageSimulated(target, messageId, msg.value);

        (bool success, bytes memory result) = target.call{value: msg.value}(message.data);
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

    function setExtraFee(uint256 newExtraFee) external override onlyOwner {
        _extraFee = newExtraFee;
        emit ExtraFeeUpdated(newExtraFee);
    }

    function shouldResetPeriod() external view returns (bool) {
        uint256 timeLeft = this.getTimeUntilReset();
        return timeLeft == 0;
    }

    function setFeeConfig(address _admin, address _feeToken, uint256 _baseFee) external onlyOwner {
        admin = _admin;
        feeToken = _feeToken;
        baseFee = _baseFee;
    }

    receive() external payable override {}
}
