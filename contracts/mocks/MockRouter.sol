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
    bool private _routerInitialized;

    event MessageReceived(bytes32 indexed messageId, uint64 indexed sourceChainSelector, Client.Any2EVMMessage message);
    event MessageSimulated(address indexed target, bytes32 indexed messageId, uint256 value);
    event MessageSent(bytes32 indexed messageId, uint64 indexed destinationChainSelector, Client.EVM2AnyMessage message);

    constructor() {
        // Initialization moved to initialize function
    }

    function initialize(
        address admin,
        address feeToken,
        uint256 baseFee
    ) public virtual {
        require(!_routerInitialized, "MockRouter: already initialized");
        require(admin != address(0), "Invalid admin address");
        require(feeToken != address(0), "Invalid fee token address");

        // Initialize rate limiter first using internal function
        _initialize(100, 3600); // Default values: 100 messages per hour

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
        require(_supportedChains[message.sourceChainSelector], "Chain not supported");
        require(validateMessage(message), "Invalid message");
        require(processMessage(), "Rate limit exceeded");

        uint256 startGas = gasleft();
        (success, retBytes) = receiver.call{gas: gasLimit}(message.data);
        gasUsed = startGas - gasleft();

        if (success && gasForCallExactCheck > 0) {
            require(gasUsed <= gasLimit, "Exceeded gas limit");
        }

        emit MessageReceived(message.messageId, message.sourceChainSelector, message);

        return (success, retBytes, gasUsed);
    }

    function validateMessage(Client.Any2EVMMessage memory message) public pure virtual returns (bool) {
        if (message.messageId == bytes32(0)) {
            revert("Invalid message ID");
        }
        if (message.sourceChainSelector == 0) {
            revert("Chain not supported");
        }
        if (message.sender.length != 20) {
            revert("Invalid sender length");
        }
        if (message.data.length == 0) {
            revert("Empty message data");
        }
        return true;
    }

    function simulateMessageReceived(
        address target,
        Client.Any2EVMMessage memory message
    ) external virtual payable {
        require(target != address(0), "Invalid target address");
        require(validateMessage(message), "Message validation failed");
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
        uint256 totalFee = _baseFee;
        if (message.data.length > 0) {
            totalFee += _extraFee;
        }
        return totalFee;
    }

    receive() external payable virtual {}
}
