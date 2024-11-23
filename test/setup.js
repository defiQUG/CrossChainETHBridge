const chai = require("chai");
const { waffleChai } = require("@ethereum-waffle/chai");
const { solidity } = require("ethereum-waffle");
const { ethers } = require("hardhat");

// Initialize utilities from hardhat's ethers instance
const parseEther = (value) => ethers.parseUnits(value.toString(), 18);

chai.use(waffleChai);
chai.use(solidity);

module.exports = {
  expect: chai.expect,
  parseEther
};
