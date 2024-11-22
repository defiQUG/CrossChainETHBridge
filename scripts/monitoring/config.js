const { ethers } = require("ethers");

module.exports = {
  POLYGON_CHAIN_ID: 137,
  DEFI_ORACLE_META_CHAIN_ID: 138,
  CHECK_INTERVAL: 60000,
  MAX_GAS_PRICE: ethers.utils.parseUnits("100", "gwei"),
  MAX_MESSAGES_PER_HOUR: 100,
  ALERT_THRESHOLD_MESSAGES: 80,
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
  RPC_URL: process.env.RPC_URL || "http://localhost:8545"
};
