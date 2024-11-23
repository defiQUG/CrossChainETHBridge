const { ethers } = require("hardhat");

// Shared test configuration
const TEST_CONFIG = {
    POLYGON_CHAIN_SELECTOR: 137n,
    DEFI_ORACLE_META_CHAIN_SELECTOR: 138n,
    BRIDGE_FEE: ethers.parseEther("0.1"),
    MAX_FEE: ethers.parseEther("1.0"),
    MAX_MESSAGES_PER_PERIOD: 5,
    PAUSE_THRESHOLD: ethers.parseEther("5.0"),
    PAUSE_DURATION: 3600, // 1 hour
    RATE_LIMIT_PERIOD: 3600 // 1 hour
};

// Deploy all contracts needed for testing
async function deployTestContracts() {
    const [owner, user, addr1, addr2] = await ethers.getSigners();

    // Deploy MockWETH
    const MockWETH = await ethers.getContractFactory("MockWETH");
    const mockWETH = await MockWETH.deploy("Wrapped Ether", "WETH");
    await mockWETH.waitForDeployment();

    // Deploy MockRouter
    const MockRouter = await ethers.getContractFactory("MockRouter");
    const mockRouter = await MockRouter.deploy();
    await mockRouter.waitForDeployment();

    // Deploy CrossChainMessenger
    const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
    const crossChainMessenger = await CrossChainMessenger.deploy(
        await mockRouter.getAddress(),
        await mockWETH.getAddress(),
        TEST_CONFIG.BRIDGE_FEE,
        TEST_CONFIG.MAX_MESSAGES_PER_PERIOD,
        TEST_CONFIG.PAUSE_THRESHOLD,
        TEST_CONFIG.PAUSE_DURATION
    );
    await crossChainMessenger.waitForDeployment();

    // Fund the contract for tests
    await owner.sendTransaction({
        to: await crossChainMessenger.getAddress(),
        value: ethers.parseEther("10.0")
    });

    return {
        owner,
        user,
        addr1,
        addr2,
        mockWETH,
        mockRouter,
        crossChainMessenger,
        TEST_CONFIG
    };
}

module.exports = {
    TEST_CONFIG,
    deployTestContracts
};
