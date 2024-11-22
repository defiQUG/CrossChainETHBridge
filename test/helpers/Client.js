// Mock Client library for testing
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
    return {
      messageId: message.messageId || '0x',
      sourceChainSelector: message.sourceChainSelector || 0,
      sender: message.sender || '0x',
      data: message.data || '0x',
      destTokenAmounts: message.destTokenAmounts || []
    };
  }
};

module.exports = { Client };
