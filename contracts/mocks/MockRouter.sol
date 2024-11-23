// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IAny2EVMMessageReceiver.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockRouter is IRouterClient, Ownable {
    uint256 private _baseFee;
    uint256 private _extraFee;
    mapping(uint64 => bool) private _supportedChains;
    mapping(uint64 => address[]) private _supportedTokens;

    event MessageSent(
        uint64 destinationChainSelector,
        bytes message
    );
    event BaseFeeUpdated(uint256 oldFee, uint256 newFee);
    event ExtraFeeUpdated(uint256 oldFee, uint256 newFee);
    event ChainSupportUpdated(uint64 chainSelector, bool supported);
    event TokenSupportUpdated(uint64 chainSelector, address[] tokens);

    constructor() {
        _supportedChains[137] = true; // Polygon PoS
        _supportedChains[138] = true; // Defi Oracle Meta
        _baseFee = 0.01 ether; // Set default base fee
    }

    function setBaseFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = _baseFee;
        _baseFee = newFee;
        emit BaseFeeUpdated(oldFee, newFee);
    }

    function setExtraFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = _extraFee;
        _extraFee = newFee;
        emit ExtraFeeUpdated(oldFee, newFee);
    }

    function setSupportedChain(uint64 chainSelector, bool supported) external onlyOwner {
        _supportedChains[chainSelector] = supported;
        emit ChainSupportUpdated(chainSelector, supported);
    }

    function setSupportedTokens(uint64 chainSelector, address[] calldata tokens) external onlyOwner {
        _supportedTokens[chainSelector] = tokens;
        emit TokenSupportUpdated(chainSelector, tokens);
    }

    function ccipSend(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) external payable override returns (bytes32) {
        require(_supportedChains[destinationChainSelector], "Chain not supported");
        uint256 requiredFee = getFee(destinationChainSelector, message);
        require(msg.value >= requiredFee, "Insufficient fee");

        bytes memory encodedMessage = abi.encode(
            message.receiver,
            message.data,
            message.tokenAmounts,
            message.extraArgs,
            message.feeToken
        );

        emit MessageSent(
            destinationChainSelector,
            encodedMessage
        );

        if (msg.value > requiredFee) {
            payable(msg.sender).transfer(msg.value - requiredFee);
        }

        return keccak256(encodedMessage);
    }

    function sendMessage(
        address receiver,
        uint256 amount
    ) external payable returns (bytes32) {
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: abi.encode(amount),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: "",
            feeToken: address(0)
        });

        return this.ccipSend(137, message);
    }

    function getFee(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) public view override returns (uint256) {
        require(_supportedChains[destinationChainSelector], "Chain not supported");

        uint256 totalFee = _baseFee;

        // Add extra fee if message contains token transfers
        if (message.tokenAmounts.length > 0) {
            totalFee += _extraFee;
        }

        return totalFee;
    }

    function isChainSupported(uint64 chainSelector) external view override returns (bool) {
        return _supportedChains[chainSelector];
    }

    function getSupportedTokens(uint64 chainSelector) external view returns (address[] memory) {
        require(_supportedChains[chainSelector], "Chain not supported");
        return _supportedTokens[chainSelector];
    }

    function validateMessage(Client.Any2EVMMessage memory message) public pure returns (bool) {
        if (message.sourceChainSelector == 0) {
            revert("Invalid chain selector");
        }

        (address recipient, ) = abi.decode(message.data, (address, uint256));
        if (recipient == address(0)) {
            revert("Invalid recipient");
        }

        return true;
    }

    function simulateMessageReceived(
        address target,
        Client.Any2EVMMessage memory message
    ) external {
        require(_supportedChains[message.sourceChainSelector], "Chain not supported");
        require(target != address(0), "Invalid target address");
        require(validateMessage(message), "Message validation failed");

        IAny2EVMMessageReceiver(target).ccipReceive(message);
    }

    function ccipReceive(Client.Any2EVMMessage memory message) external {
        require(validateMessage(message), "Invalid message");
        emit MessageSent(message.sourceChainSelector, message.data);
    }

    receive() external payable {}
}
