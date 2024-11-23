const chai = require("chai");
const { waffleChai } = require("@ethereum-waffle/chai");
const { solidity } = require("ethereum-waffle");
const { ethers } = require("hardhat");
const { parseEther } = require("ethers");

chai.use(waffleChai);
chai.use(solidity);

module.exports = {
  expect: chai.expect,
  parseEther: (value) => ethers.parseUnits(value.toString(), 18)
};
