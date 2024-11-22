// Mock Client library for testing
const { ethers } = require("hardhat");

const Client = {
  EVM2AnyMessage: function(message) {
    return {
      receiver: message.receiver || '0x',
      data: message.data || '0x',
      tokenAmounts: message.tokenAmounts || [],
      extraArgs: message.extraArgs || '0x',
      feeToken: message.feeToken || '0x0000000000000000000000000000000000000000'
    };
  },
  Any2EVMMessage: function(message) {
    // Generate a deterministic messageId based on the message content
    const messageId = ethers.utils.hexZeroPad(
      ethers.utils.hexlify(ethers.utils.randomBytes(32)),
      32
    );
    return {
      messageId: messageId,
      sourceChainSelector: message.sourceChainSelector || 0,
      sender: message.sender || '0x',
      data: message.data || '0x',
      destTokenAmounts: message.destTokenAmounts || []
    };
  },
  encodeEVM2AnyMessage: function(message, version) {
    return ethers.utils.defaultAbiCoder.encode(
      ["tuple(bytes, bytes, tuple(address, uint256)[], bytes, address)"],
      [[
        message.receiver,
        message.data,
        message.tokenAmounts,
        message.extraArgs,
        message.feeToken
      ]]
    );
  }
};

module.exports = { Client };
