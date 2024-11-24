require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("dotenv").config();

// Only include external networks if environment variables are present
const networks = {
  hardhat: {
    chainId: 31337
  }
};

// Add external networks only if configuration is available
if (process.env.DEFI_ORACLE_META_URL && process.env.PRIVATE_KEY) {
  networks.defiOracleMeta = {
    url: process.env.DEFI_ORACLE_META_URL,
    accounts: [process.env.PRIVATE_KEY],
    chainId: 138
  };
}

if (process.env.POLYGON_URL && process.env.PRIVATE_KEY) {
  networks.polygon = {
    url: process.env.POLYGON_URL,
    accounts: [process.env.PRIVATE_KEY],
    chainId: 137
  };
}

module.exports = {
  solidity: "0.8.20",
  networks,
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
