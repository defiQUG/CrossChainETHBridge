const { ethers } = require("hardhat");

async function deployContract(name, args = [], options = {}) {
    // Use fully qualified names for security contracts
    let contractName = name;
    if (name === "EmergencyPause" || name === "RateLimiter" || name === "SecurityBase") {
        contractName = `contracts/security/${name}.sol:${name}`;
    } else if (name === "TestRouter" || name === "MockRouter") {
        contractName = `contracts/mocks/${name}.sol:${name}`;
    }

    const Factory = await ethers.getContractFactory(contractName);

    // Ensure args is an array and remove any undefined values
    const cleanArgs = (Array.isArray(args) ? args : [args]).filter(arg => arg !== undefined);

    // Convert numeric values to BigNumber
    const deploymentArgs = cleanArgs.map(arg => {
        if (typeof arg === 'number' || typeof arg === 'bigint') {
            return ethers.BigNumber.from(arg.toString());
        }
        if (typeof arg === 'string' && arg.startsWith('0x')) {
            return arg; // Keep hex strings as-is
        }
        return arg;
    });

    // Debug logging
    console.log(`Deploying ${name}:`, {
        contractName,
        args: deploymentArgs,
        argsLength: deploymentArgs.length,
        argTypes: deploymentArgs.map(arg => typeof arg)
    });

    try {
        // Deploy with proper ethers v5 overrides format
        const contract = await Factory.deploy(...deploymentArgs);
        await contract.deployed();
        console.log(`Successfully deployed ${name} at ${contract.address}`);
        return contract;
    } catch (error) {
        console.error(`Failed to deploy ${name}:`, {
            error: error.message,
            contractName,
            args: deploymentArgs,
            argsLength: deploymentArgs.length
        });
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
