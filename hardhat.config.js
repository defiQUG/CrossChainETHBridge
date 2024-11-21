require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    defiOracleMeta: process.env.PRIVATE_KEY ? {
      url: process.env.DEFI_ORACLE_META_RPC_URL || `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 138,
      accounts: [process.env.PRIVATE_KEY]
    } : undefined,
    polygon: process.env.PRIVATE_KEY ? {
      url: process.env.POLYGON_RPC_URL || `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 137,
      accounts: [process.env.PRIVATE_KEY]
    } : undefined
  }
};
