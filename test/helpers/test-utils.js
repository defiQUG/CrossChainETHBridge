const { ethers } = require("hardhat");

async function deployContract(name, args = [], options = {}) {
    // Handle abstract contracts
    if (name.includes("MockRouter")) {
        name = "TestRouter";
    }

    const Factory = await ethers.getContractFactory(name);
    const deploymentArgs = args.map(arg => {
        if (typeof arg === 'number' || typeof arg === 'bigint') {
            return ethers.getBigInt(arg.toString());
        }
        if (typeof arg === 'string' && arg.startsWith('0x')) {
            return arg; // Keep hex strings as-is
        }
        return arg;
    });

    // Deploy with proper options handling
    try {
        const contract = await Factory.deploy(...deploymentArgs, { ...options });
        await contract.waitForDeployment();
        return contract;
    } catch (error) {
        console.error(`Failed to deploy ${name}:`, error);
        throw error;
    }
}

async function getContractAt(name, address) {
    const Factory = await ethers.getContractFactory(name);
    return Factory.attach(address);
}

function createCCIPMessage({
    messageId = ethers.hexlify(ethers.randomBytes(32)),
    sourceChainSelector = 138n,
    sender,
    data,
    destTokenAmounts = [],
    feeToken = ethers.ZeroAddress,
    extraArgs = "0x"
} = {}) {
    if (!sender) throw new Error("Sender address is required");
    if (!data) throw new Error("Message data is required");

    return {
        messageId,
        sourceChainSelector,
        sender: ethers.zeroPadValue(sender, 20),
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
