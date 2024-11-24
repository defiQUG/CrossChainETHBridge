const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

async function deployContract(contractName, args = []) {
  const Factory = await ethers.getContractFactory(contractName);
  const contract = await Factory.deploy(...args);
  return contract;
}

async function getSigners() {
  const [owner, user1, user2, user3] = await ethers.getSigners();
  return { owner, user1, user2, user3 };
}

module.exports = {
  expect,
  loadFixture,
  deployContract,
  getSigners,
  ethers
};
