const { ethers } = require("hardhat");

// Chain selectors for supported networks
const CHAIN_SELECTORS = {
    DEFI_ORACLE_META: 138n,
    POLYGON_POS: 137n
};

async function deployContract(name, args = [], options = {}) {
    // Use fully qualified names for security contracts
    let contractName = name;
    if (name === "EmergencyPause" || name === "RateLimiter" || name === "SecurityBase") {
        contractName = `contracts/security/${name}.sol:${name}`;
    } else if (name.includes("MockRouter")) {
        contractName = "TestRouter";
        // Add default chain selectors if not provided
        if (args.length === 0) {
            args = [CHAIN_SELECTORS.DEFI_ORACLE_META, CHAIN_SELECTORS.POLYGON_POS];
        }
    }

    const Factory = await ethers.getContractFactory(contractName);
    const deploymentArgs = args.map(arg => {
        if (typeof arg === 'number' || typeof arg === 'bigint') {
            return ethers.getBigInt(arg.toString());
        }
        if (typeof arg === 'string' && arg.startsWith('0x')) {
            return arg; // Keep hex strings as-is
        }
        return arg;
    });

    // Deploy with proper options and error handling
    try {
        const contract = await Factory.deploy(...deploymentArgs, { ...options });
        await contract.waitForDeployment();
        return contract;
    } catch (error) {
        console.error(`Failed to deploy ${name} with args:`, deploymentArgs);
        console.error('Error details:', error.message);
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
    messageId = ethers.hexlify(ethers.randomBytes(32)),
    sourceChainSelector = CHAIN_SELECTORS.DEFI_ORACLE_META,
    sender,
    data,
    destTokenAmounts = [],
    feeToken = ethers.ZeroAddress,
    extraArgs = "0x"
} = {}) {
    if (!sender) throw new Error("Sender address is required");
    if (!data) throw new Error("Message data is required");
    if (!Object.values(CHAIN_SELECTORS).includes(sourceChainSelector)) {
        throw new Error("Invalid chain selector");
    }

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
    CHAIN_SELECTORS,
    deployContract,
    getContractAt,
    createCCIPMessage
};
