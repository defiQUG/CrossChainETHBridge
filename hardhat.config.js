require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    defiOracleMeta: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 138,
      accounts: [process.env.PRIVATE_KEY].filter(Boolean)
    },
    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 137,
      accounts: [process.env.PRIVATE_KEY].filter(Boolean)
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
