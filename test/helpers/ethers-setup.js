const { ethers } = require("hardhat");

async function getSigners() {
  return await ethers.getSigners();
}

async function parseEther(amount) {
  return ethers.parseEther(amount.toString());
}

async function deployContract(name, ...args) {
  const Contract = await ethers.getContractFactory(name);
  const contract = await Contract.deploy(...args);
  await contract.waitForDeployment();
  return contract;
}

module.exports = {
  getSigners,
  parseEther,
  deployContract
};
