require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("@typechain/hardhat");

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
  networks: {
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true,
      gas: 12000000,
      blockGasLimit: 12000000
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      allowUnlimitedContractSize: true,
      gas: 12000000,
      blockGasLimit: 12000000
    }
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    outputFile: 'gas-report.txt',
    noColors: true
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5'
  },
  mocha: {
    timeout: 100000
  }
};
