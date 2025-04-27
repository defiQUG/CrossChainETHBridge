const { ethers } = require("hardhat");

async function getSigners() {
  return await ethers.getSigners();
}

async function parseEther(amount) {
  return ethers.utils.parseEther(amount.toString());
}

async function deployContract(name, ...args) {
  const Contract = await ethers.getContractFactory(name);
  // Handle array arguments correctly
  const contract = Array.isArray(args[0]) ?
    await Contract.deploy(...args[0]) :
    await Contract.deploy(...args);
  await contract.deployed();
  return contract;
}

module.exports = {
  getSigners,
  parseEther,
  deployContract
};
