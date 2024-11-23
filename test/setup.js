const chai = require("chai");
const { waffleChai } = require("@ethereum-waffle/chai");
const { solidity } = require("ethereum-waffle");
const { ethers } = require("hardhat");
const { parseEther } = ethers;

chai.use(waffleChai);
chai.use(solidity);

module.exports = {
  expect: chai.expect,
  parseEther
};
