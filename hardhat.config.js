require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

// Load environment variables, with fallbacks for local development
const {DEFI_ORACLE_META_RPC_URL} = process.env;
const {POLYGON_RPC_URL} = process.env;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const {POLYGONSCAN_API_KEY} = process.env;

// Network configurations
const networks = {
  hardhat: {
    chainId: 31337
  }
};

// Add external networks only if environment variables are available
if (DEFI_ORACLE_META_RPC_URL && PRIVATE_KEY) {
  networks.defiOracleMeta = {
    url: DEFI_ORACLE_META_RPC_URL,
    accounts: [PRIVATE_KEY],
    chainId: 138,
    verify: {
      etherscan: {
        apiUrl: "https://scan.dofm.org"
      }
    }
  };
}

if (POLYGON_RPC_URL && PRIVATE_KEY) {
  networks.polygon = {
    url: POLYGON_RPC_URL,
    accounts: [PRIVATE_KEY],
    chainId: 137,
    verify: {
      etherscan: {
        apiKey: POLYGONSCAN_API_KEY
      }
    }
  };
}

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks,
  etherscan: {
    apiKey: {
      polygon: POLYGONSCAN_API_KEY
    },
    customChains: [
      {
        network: "defiOracleMeta",
        chainId: 138,
        urls: {
          apiURL: "https://scan.dofm.org/api",
          browserURL: "https://scan.dofm.org"
        }
      }
    ]
  }
};
