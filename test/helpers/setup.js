const { ethers } = require("hardhat");

// Shared test configuration
const TEST_CONFIG = {
    POLYGON_CHAIN_SELECTOR: 137n,
    DEFI_ORACLE_META_CHAIN_SELECTOR: 138n,
    BRIDGE_FEE: ethers.utils.parseEther("0.001"),  // Aligned with TestRouter default fee
    MAX_FEE: ethers.utils.parseEther("0.1"),
    MAX_MESSAGES_PER_PERIOD: 1000,  // Increased to handle more messages in tests
    PAUSE_THRESHOLD: ethers.utils.parseEther("100.0"),  // Increased from 5.0 to 100.0 to match test scenarios
    PAUSE_DURATION: 7200, // Increased to 2 hours
    PERIOD_DURATION: 7200 // Increased to 2 hours for more flexibility
};

// Deploy all contracts needed for testing
async function deployTestContracts() {
    const [owner, user, addr1, addr2] = await ethers.getSigners();

    // Deploy MockWETH
    const MockWETH = await ethers.getContractFactory("MockWETH");
    const mockWETH = await MockWETH.deploy("Wrapped Ether", "WETH");
    await mockWETH.deployed();

    // Deploy RateLimiter with constructor params
    const RateLimiter = await ethers.getContractFactory("RateLimiter");
    const rateLimiter = await RateLimiter.deploy(
        TEST_CONFIG.MAX_MESSAGES_PER_PERIOD,
        TEST_CONFIG.PERIOD_DURATION
    );
    await rateLimiter.deployed();

    // Deploy EmergencyPause
    const EmergencyPause = await ethers.getContractFactory("EmergencyPause");
    const emergencyPause = await EmergencyPause.deploy(
        TEST_CONFIG.PAUSE_THRESHOLD,
        TEST_CONFIG.PAUSE_DURATION
    );
    await emergencyPause.deployed();

    // Deploy MockRouter with rate limiter params
    const MockRouter = await ethers.getContractFactory("MockRouter");
    const mockRouter = await MockRouter.deploy(
        TEST_CONFIG.MAX_MESSAGES_PER_PERIOD,
        TEST_CONFIG.PERIOD_DURATION
    );
    await mockRouter.deployed();

    // Initialize MockRouter after all dependencies are deployed
    await mockRouter.initialize(
        owner.address,
        mockWETH.address,
        TEST_CONFIG.BRIDGE_FEE
    );

    // Deploy CrossChainMessenger with initialized contracts
    const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
    const crossChainMessenger = await CrossChainMessenger.deploy(
        mockRouter.address,
        mockWETH.address,
        rateLimiter.address,
        emergencyPause.address,
        TEST_CONFIG.BRIDGE_FEE,
        TEST_CONFIG.MAX_FEE
    );
    await crossChainMessenger.deployed();

    // Fund the contract for tests
    await owner.sendTransaction({
        to: crossChainMessenger.address,
        value: ethers.utils.parseEther("10.0")
    });

    return {
        owner,
        user,
        addr1,
        addr2,
        mockWETH,
        mockRouter,
        rateLimiter,
        emergencyPause,
        crossChainMessenger,
        TEST_CONFIG
    };
}

module.exports = {
    TEST_CONFIG,
    deployTestContracts
};
