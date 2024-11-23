const { ethers } = require("hardhat");

async function deployContract(name, args = []) {
    const Factory = await ethers.getContractFactory(name);
    const deploymentArgs = args.map(arg =>
        typeof arg === 'bigint' ? arg.toString() : arg
    );
    const contract = await Factory.deploy(...deploymentArgs);
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
