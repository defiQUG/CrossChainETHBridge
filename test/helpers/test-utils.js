const { ethers } = require("hardhat");

async function deployContract(name, args = [], options = {}) {
    const Factory = await ethers.getContractFactory(name);
    const deploymentArgs = args.map(arg => {
        if (typeof arg === 'number' || typeof arg === 'bigint') {
            return ethers.getBigInt(arg.toString());
        }
        return arg;
    });
    const contract = await Factory.deploy(...deploymentArgs, options);
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
