// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./MockRouter.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";

// Chain selectors for supported networks
uint64 constant DEFI_ORACLE_META_CHAIN_SELECTOR = 138;
uint64 constant POLYGON_CHAIN_SELECTOR = 137;

contract TestRouter is MockRouter, IRouterClient {
    mapping(address => bool) public testSupportedTokens;
    uint256 private constant BASE_FEE = 600000000000000000; // 0.6 ETH base fee

    // Events for state changes
    event ChainSupportUpdated(uint64 indexed chainSelector, bool supported);
    event TokenSupportUpdated(address indexed token, bool supported);
    event ExtraFeeUpdated(uint256 newFee);

    constructor(
        uint256 maxMessages,
        uint256 periodDuration
    ) MockRouter(maxMessages, periodDuration) {
        // Initialize with parent constructor
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

    function isChainSupported(
        uint64 destChainSelector
    ) external view override returns (bool) {
        return _supportedChains[destChainSelector];
    }

    function ccipSend(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) external payable override(IRouterClient, MockRouter) returns (bytes32) {
        require(
            _supportedChains[destinationChainSelector],
            "TestRouter: chain not supported"
        );
        require(
            msg.value >= getFee(destinationChainSelector, message),
            "TestRouter: insufficient fee"
        );

        bytes32 messageId = keccak256(
            abi.encode(
                block.timestamp,
                msg.sender,
                destinationChainSelector,
                message
            )
        );

        emit MessageSent(messageId, destinationChainSelector, message);
        return messageId;
    }

    function getFee(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) public view override(MockRouter, IRouterClient) returns (uint256) {
        require(
            _supportedChains[destinationChainSelector],
            "TestRouter: chain not supported"
        );
        return BASE_FEE + _extraFee;
    }

    function validateMessage(
        Client.Any2EVMMessage memory message
    ) public pure override returns (bool) {
        require(
            message.messageId != bytes32(0),
            "TestRouter: invalid message ID"
        );
        require(
            message.sourceChainSelector != 0,
            "TestRouter: chain not supported"
        );
        require(message.sender.length > 0, "TestRouter: empty sender address");
        require(message.data.length > 0, "TestRouter: empty message data");
        require(
            message.destTokenAmounts.length == 0,
            "TestRouter: token transfers not supported"
        );
        return true;
    }

    function routeMessage(
        Client.Any2EVMMessage calldata message,
        uint16 gasForCallExactCheck,
        uint256 gasLimit,
        address receiver
    )
        external
        override
        returns (bool success, bytes memory retBytes, uint256 gasUsed)
    {
        require(
            _supportedChains[message.sourceChainSelector],
            "TestRouter: chain not supported"
        );
        require(validateMessage(message), "TestRouter: invalid message");
        require(super.processMessage(), "TestRouter: rate limit exceeded");

        uint256 startGas = gasleft();
        (success, retBytes) = receiver.call{gas: gasLimit}(message.data);
        gasUsed = startGas - gasleft();

        if (success && gasForCallExactCheck > 0) {
            require(gasUsed <= gasLimit, "TestRouter: gas limit exceeded");
        }

        emit MessageReceived(
            message.messageId,
            message.sourceChainSelector,
            message
        );
        return (success, retBytes, gasUsed);
    }

    function simulateMessageReceived(
        address target,
        Client.Any2EVMMessage memory message
    ) external payable override whenNotPaused {
        require(target != address(0), "TestRouter: invalid target address");
        require(
            _supportedChains[message.sourceChainSelector],
            "TestRouter: chain not supported"
        );
        require(validateMessage(message), "TestRouter: invalid message");
        require(processMessage(), "TestRouter: rate limit exceeded");

        // Validate target contract exists
        uint256 size;
        assembly {
            size := extcodesize(target)
        }
        require(size > 0, "TestRouter: target contract does not exist");

        bytes32 messageId = keccak256(
            abi.encode(
                message.messageId,
                target,
                message.sourceChainSelector,
                message.data,
                msg.value
            )
        );
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

    function setSupportedChain(
        uint64 chainSelector,
        bool supported
    ) external onlyOwner {
        _supportedChains[chainSelector] = supported;
        emit ChainSupportUpdated(chainSelector, supported);
    }

    function setSupportedTokens(
        address token,
        bool supported
    ) external override onlyOwner {
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

    function setFeeConfig(
        address admin,
        address feeToken,
        uint256 baseFee
    ) external onlyOwner {
        _admin = admin;
        _feeToken = feeToken;
        _baseFee = baseFee;
    }

    receive() external payable override {}
}
