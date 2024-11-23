// Mock Client library for testing
const { ethers } = require("hardhat");
const { CHAIN_SELECTORS } = require("./test-utils");

const Client = {
    EVM2AnyMessage: function(message) {
        if (!message || typeof message !== 'object') {
            throw new Error("Invalid message object");
        }
        return {
            receiver: ethers.zeroPadValue(message.receiver || '0x', 20),
            data: message.data || '0x',
            tokenAmounts: message.tokenAmounts || [],
            extraArgs: message.extraArgs || '0x',
            feeToken: message.feeToken || ethers.ZeroAddress
        };
    },

    Any2EVMMessage: function(message) {
        if (!message || typeof message !== 'object') {
            throw new Error("Invalid message object");
        }
        if (!Object.values(CHAIN_SELECTORS).includes(message.sourceChainSelector)) {
            throw new Error(`Invalid chain selector. Expected one of: ${Object.values(CHAIN_SELECTORS).join(', ')}`);
        }

        // Generate deterministic messageId based on message content
        const messageContent = ethers.concat([
            ethers.toBeHex(message.sourceChainSelector || 0n),
            ethers.zeroPadValue(message.sender || '0x', 20),
            message.data || '0x'
        ]);
        const messageId = ethers.keccak256(messageContent);

        return {
            messageId,
            sourceChainSelector: message.sourceChainSelector,
            sender: ethers.zeroPadValue(message.sender || '0x', 20),
            data: message.data || '0x',
            destTokenAmounts: message.destTokenAmounts || []
        };
    },

    encodeEVM2AnyMessage: function(message, version = 1) {
        if (!message || typeof message !== 'object') {
            throw new Error("Invalid message object");
        }
        if (version !== 1) {
            throw new Error("Unsupported message version");
        }

        return ethers.AbiCoder.defaultAbiCoder().encode(
            ["tuple(bytes, bytes, tuple(address, uint256)[], bytes, address)"],
            [[
                ethers.zeroPadValue(message.receiver || '0x', 20),
                message.data || '0x',
                message.tokenAmounts || [],
                message.extraArgs || '0x',
                message.feeToken || ethers.ZeroAddress
            ]]
        );
    }
};

module.exports = { Client };
