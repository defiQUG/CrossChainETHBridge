// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouter.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../security/RateLimiter.sol";

contract MockRouter is IRouter, ReentrancyGuard, RateLimiter {
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
    ) RateLimiter(maxMessages, periodDuration) {
        _supportedChains[138] = true; // Defi Oracle Meta Chain
        _supportedChains[137] = true; // Polygon Chain
        _baseFee = 600000000000000000; // 0.6 ether
        _extraFee = 500000000000000000; // 0.5 ether
    }

    function initialize(
        address admin,
        address feeToken,
        uint256 baseFee
    ) public virtual {
        require(!_routerInitialized, "Already initialized");
        require(admin != address(0), "Invalid admin address");
        require(feeToken != address(0), "Invalid fee token address");

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
        if (!_supportedChains[message.sourceChainSelector]) {
            revert("Chain not supported");
        }
        require(validateMessage(message), "Invalid message");
        require(processMessage(), "Rate limit exceeded");

        uint256 startGas = gasleft();
        (success, retBytes) = receiver.call{gas: gasLimit}(message.data);
        gasUsed = startGas - gasleft();

        if (success && gasForCallExactCheck > 0) {
            require(gasUsed <= gasLimit, "Gas limit exceeded");
        }

        emit MessageReceived(message.messageId, message.sourceChainSelector, message);
        return (success, retBytes, gasUsed);
    }

    function validateMessage(Client.Any2EVMMessage memory message) public pure virtual returns (bool) {
        if (message.messageId == bytes32(0)) {
            revert("Invalid message");
        }
        if (message.sourceChainSelector == 0) {
            revert("Invalid chain selector");
        }
        if (message.sender.length == 0) {
            revert("Invalid sender");
        }
        if (message.data.length == 0) {
            revert("Invalid message");
        }
        return true;
    }

    function simulateMessageReceived(
        address target,
        Client.Any2EVMMessage memory message
    ) external virtual payable {
        require(target != address(0), "Invalid target");
        require(validateMessage(message), "Invalid message");
        require(processMessage(), "Rate limit exceeded");

        bytes32 messageId = keccak256(abi.encode(message));
        emit MessageSimulated(target, messageId, msg.value);

        bytes4 depositSelector = bytes4(keccak256("deposit()"));
        bytes memory depositCall = abi.encodeWithSelector(depositSelector);

        (bool success, bytes memory result) = target.call{value: msg.value}(depositCall);

        if (!success) {
            assembly {
                if gt(returndatasize(), 0) {
                    let ptr := mload(0x40)
                    returndatacopy(ptr, 0, returndatasize())
                    revert(ptr, returndatasize())
                }
                revert(0, 0)
            }
        }
    }

    function getFee(uint64 destinationChainSelector, Client.EVM2AnyMessage memory message) public view virtual returns (uint256) {
        if (!_supportedChains[destinationChainSelector]) {
            revert("Chain not supported");
        }
        return _baseFee;  // Return only base fee for fee calculation display
    }

    function ccipSend(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage calldata message
    ) external payable virtual returns (bytes32) {
        if (!_supportedChains[destinationChainSelector]) {
            revert("Chain not supported");
        }
        uint256 requiredFee = _baseFee + _extraFee;  // Calculate total required fee
        if (msg.value < requiredFee) {
            revert("Insufficient fee");
        }
        require(processMessage(), "Rate limit exceeded");

        bytes32 messageId = keccak256(abi.encode(block.timestamp, message, msg.sender));
        emit MessageSent(messageId, destinationChainSelector, message);

        return messageId;
    }

    function getSupportedTokens(uint64 chainSelector) external view virtual returns (address[] memory) {
        if (!_supportedChains[chainSelector]) {
            revert("Chain not supported");
        }
        return _supportedTokens[chainSelector];
    }

    function setSupportedTokens(address token, bool supported) external virtual onlyOwner {
        require(token != address(0), "Invalid token address");

        // Remove existing token if not supported
        if (!supported) {
            address[] storage tokens138 = _supportedTokens[138];
            address[] storage tokens137 = _supportedTokens[137];

            for (uint i = 0; i < tokens138.length; i++) {
                if (tokens138[i] == token) {
                    tokens138[i] = tokens138[tokens138.length - 1];
                    tokens138.pop();
                    break;
                }
            }

            for (uint i = 0; i < tokens137.length; i++) {
                if (tokens137[i] == token) {
                    tokens137[i] = tokens137[tokens137.length - 1];
                    tokens137.pop();
                    break;
                }
            }
        } else {
            // Add token if not already present
            bool exists138 = false;
            bool exists137 = false;

            for (uint i = 0; i < _supportedTokens[138].length; i++) {
                if (_supportedTokens[138][i] == token) {
                    exists138 = true;
                    break;
                }
            }

            for (uint i = 0; i < _supportedTokens[137].length; i++) {
                if (_supportedTokens[137][i] == token) {
                    exists137 = true;
                    break;
                }
            }

            if (!exists138) _supportedTokens[138].push(token);
            if (!exists137) _supportedTokens[137].push(token);
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
