const { ethers } = require("hardhat");

async function deployContract(name, args = []) {
    const Factory = await ethers.getContractFactory(name);
    const contract = await Factory.deploy(...args);
    await contract.waitForDeployment();
    return contract;
}

async function getContractAt(name, address) {
    const Factory = await ethers.getContractFactory(name);
    return Factory.attach(address);
}

module.exports = {
    deployContract,
    getContractAt
};
