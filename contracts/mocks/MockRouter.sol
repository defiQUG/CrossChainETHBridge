// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouter.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../security/SecurityBase.sol";
import "../interfaces/ICrossChainMessenger.sol";

contract MockRouter is IRouter, ReentrancyGuard, SecurityBase {
    using Client for Client.Any2EVMMessage;
    using Client for Client.EVM2AnyMessage;

    mapping(uint64 => bool) internal _supportedChains;
    mapping(uint64 => address[]) internal _supportedTokens;
    mapping(uint64 => address) internal _onRamps;
    mapping(uint64 => mapping(address => bool)) internal _offRamps;

    uint256 internal _baseFee;
    uint256 internal _extraFee;
    address internal _admin;
    address internal _feeToken;
    bool internal _routerInitialized;

    event MessageReceived(bytes32 indexed messageId, uint64 indexed sourceChainSelector, Client.Any2EVMMessage message);
    event MessageSimulated(address indexed target, bytes32 indexed messageId, uint256 value);
    event MessageSent(bytes32 indexed messageId, uint64 indexed destinationChainSelector, Client.EVM2AnyMessage message);

    constructor(
        uint256 maxMessages,
        uint256 periodDuration
    ) SecurityBase(maxMessages, periodDuration) {
        // Initialize supported chains in constructor
        _supportedChains[138] = true; // Defi Oracle Meta Chain
        _supportedChains[137] = true; // Polygon Chain
    }

    function initialize(
        address admin,
        address feeToken,
        uint256 baseFee
    ) public virtual {
        require(!_routerInitialized, "MockRouter: already initialized");
        require(admin != address(0), "MockRouter: invalid admin address");
        require(feeToken != address(0), "MockRouter: invalid fee token address");

        _admin = admin;
        _feeToken = feeToken;
        _baseFee = baseFee;
        _extraFee = baseFee / 2; // Set extra fee to half of base fee
        _routerInitialized = true;
        _transferOwnership(admin);
    }

    function getOnRamp(uint64 destChainSelector) external view returns (address) {
        return _onRamps[destChainSelector];
    }

    function isOffRamp(uint64 sourceChainSelector, address offRamp) external view returns (bool) {
        return _offRamps[sourceChainSelector][offRamp];
    }

    function routeMessage(
        Client.Any2EVMMessage calldata message,
        uint16 gasForCallExactCheck,
        uint256 gasLimit,
        address receiver
    ) external virtual returns (bool success, bytes memory retBytes, uint256 gasUsed) {
        require(validateMessage(message), "MockRouter: invalid message");
        require(super.processMessage(), "MockRouter: rate limit exceeded");

        uint256 startGas = gasleft();

        // Call ccipReceive on the target contract
        bytes4 ccipReceiveSelector = bytes4(keccak256("ccipReceive((bytes32,uint64,bytes,bytes,bytes[],address[],bytes[],bytes32[],bytes[]))"));
        bytes memory ccipReceiveCall = abi.encodeWithSelector(ccipReceiveSelector, message);

        (success, retBytes) = receiver.call(ccipReceiveCall);
        gasUsed = startGas - gasleft();

        if (!success) {
            assembly {
                let ptr := mload(0x40)
                returndatacopy(ptr, 0, returndatasize())
                revert(ptr, returndatasize())
            }
        }

        emit MessageReceived(message.messageId, message.sourceChainSelector, message);
        return (success, retBytes, gasUsed);
    }

    function validateMessage(Client.Any2EVMMessage memory message) public view virtual returns (bool) {
        if (message.messageId == bytes32(0)) {
            revert("MockRouter: invalid message ID");
        }
        if (message.sourceChainSelector == 0) {
            revert("MockRouter: invalid chain selector");
        }
        if (!_supportedChains[message.sourceChainSelector]) {
            // Let the message through but don't validate it as supported
            // This allows the target contract to handle invalid chain validation
            return true;
        }
        if (message.sender.length == 0) {
            revert("MockRouter: empty sender address");
        }
        if (message.data.length == 0) {
            revert("MockRouter: empty message data");
        }
        return true;
    }

    function simulateMessageReceived(
        address target,
        Client.Any2EVMMessage memory message
    ) external virtual payable {
        require(target != address(0), "MockRouter: invalid target address");
        require(validateMessage(message), "MockRouter: message validation failed");
        require(super.processMessage(), "MockRouter: rate limit exceeded");

        bytes32 messageId = keccak256(abi.encode(message));
        emit MessageSimulated(target, messageId, msg.value);

        // Create interface for CrossChainMessenger
        ICrossChainMessenger messenger = ICrossChainMessenger(target);

        // Call ccipReceive directly through the interface
        messenger.ccipReceive(message);
    }

    function getFee(uint64 destinationChainSelector, Client.EVM2AnyMessage memory message) public view virtual returns (uint256) {
        if (!_supportedChains[destinationChainSelector]) {
            revert("MockRouter: chain not supported");
        }
        uint256 totalFee = _baseFee;
        if (message.data.length > 0) {
            totalFee += _extraFee;
        }
        return totalFee;
    }

    function ccipSend(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage calldata message
    ) external payable virtual returns (bytes32) {
        require(_supportedChains[destinationChainSelector], "MockRouter: chain not supported");
        require(super.processMessage(), "MockRouter: rate limit exceeded");

        bytes32 messageId = keccak256(abi.encode(block.timestamp, message, msg.sender));
        emit MessageSent(messageId, destinationChainSelector, message);

        return messageId;
    }

    function getSupportedTokens(uint64 chainSelector) external view virtual returns (address[] memory) {
        if (!_supportedChains[chainSelector]) {
            revert("MockRouter: chain not supported");
        }
        return _supportedTokens[chainSelector];
    }

    function setSupportedTokens(address token, bool supported) external virtual onlyOwner {
        require(token != address(0), "MockRouter: invalid token address");
        if (supported) {
            _supportedTokens[138].push(token); // Add to Defi Oracle Meta Chain
            _supportedTokens[137].push(token); // Add to Polygon Chain
        }
    }

    function _testSupportedTokens(address token) external view virtual returns (bool) {
        address[] memory tokens = _supportedTokens[138];
        for (uint i = 0; i < tokens.length; i++) {
            if (tokens[i] == token) {
                return true;
            }
        }
        return false;
    }

    receive() external payable virtual {}
}
