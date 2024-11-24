const { ethers } = require("hardhat");

async function deployContract(name, args = [], options = {}) {
    // Use fully qualified names for security contracts
    let contractName = name;
    if (name === "EmergencyPause" || name === "RateLimiter" || name === "SecurityBase") {
        contractName = `contracts/security/${name}.sol:${name}`;
        // Add default arguments for RateLimiter only if no args provided
        if (name === "RateLimiter" && (!args || args.length === 0)) {
            args = [10, 3600]; // 10 messages per hour
        }
    } else if (name === "TestRouter" || name === "MockRouter") {
        contractName = `contracts/mocks/${name}.sol:${name}`;
        // Default arguments for Router only if no args provided
        if (!args || args.length === 0) {
            args = [10, 3600]; // RateLimiter constructor params
        }
    }

    const Factory = await ethers.getContractFactory(contractName);
    const deploymentArgs = args.map(arg => {
        if (typeof arg === 'number' || typeof arg === 'bigint') {
            return ethers.BigNumber.from(arg.toString());
        }
        if (typeof arg === 'string' && arg.startsWith('0x')) {
            return arg; // Keep hex strings as-is
        }
        return arg;
    });

    // Deploy with proper options handling
    try {
        const contract = await Factory.deploy(...deploymentArgs, options);
        await contract.deployed();
        return contract;
    } catch (error) {
        console.error(`Failed to deploy ${name}:`, error);
        throw error;
    }
}

async function getContractAt(name, address) {
    let contractName = name;
    if (name === "EmergencyPause" || name === "RateLimiter" || name === "SecurityBase") {
        contractName = `contracts/security/${name}.sol:${name}`;
    }
    const Factory = await ethers.getContractFactory(contractName);
    return Factory.attach(address);
}

function createCCIPMessage({
    messageId = ethers.utils.hexlify(ethers.utils.randomBytes(32)),
    sourceChainSelector = 138n,
    sender,
    data,
    destTokenAmounts = [],
    feeToken = ethers.constants.AddressZero,
    extraArgs = "0x"
} = {}) {
    if (!sender) throw new Error("Sender address is required");
    if (!data) throw new Error("Message data is required");

    return {
        messageId,
        sourceChainSelector,
        sender: ethers.utils.hexZeroPad(sender, 20),
        data,
        destTokenAmounts,
        feeToken,
        extraArgs
    };
}

module.exports = {
    deployContract,
    getContractAt,
    createCCIPMessage
};
