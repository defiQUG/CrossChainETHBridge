const { ethers } = require("hardhat");
const { deployContract } = require("./test-utils");

// Shared test configuration
const TEST_CONFIG = {
    POLYGON_CHAIN_SELECTOR: 137n,
    DEFI_ORACLE_META_CHAIN_SELECTOR: 138n,
    BRIDGE_FEE: ethers.parseEther("0.001"),
    MAX_FEE: ethers.parseEther("0.1"),
    MAX_MESSAGES_PER_PERIOD: 10,
    PAUSE_THRESHOLD: ethers.parseEther("5.0"),
    PAUSE_DURATION: 3600, // 1 hour
    PERIOD_DURATION: 3600 // 1 hour
};

// Deploy all contracts needed for testing
async function deployTestContracts() {
    const [owner, user, addr1, addr2] = await ethers.getSigners();

    // Deploy MockWETH
    const mockWETH = await deployContract("MockWETH", ["Wrapped Ether", "WETH"]);

    // Deploy MockRouter
    const mockRouter = await deployContract("MockRouter");

    // Deploy RateLimiter
    const rateLimiter = await deployContract("RateLimiter", [
        TEST_CONFIG.MAX_MESSAGES_PER_PERIOD,
        TEST_CONFIG.PERIOD_DURATION
    ]);

    // Deploy EmergencyPause
    const emergencyPause = await deployContract("EmergencyPause", [
        TEST_CONFIG.PAUSE_THRESHOLD,
        TEST_CONFIG.PAUSE_DURATION
    ]);

    // Deploy CrossChainMessenger
    const crossChainMessenger = await deployContract("CrossChainMessenger", [
        await mockRouter.getAddress(),
        await mockWETH.getAddress(),
        await rateLimiter.getAddress(),
        await emergencyPause.getAddress(),
        TEST_CONFIG.BRIDGE_FEE,
        TEST_CONFIG.MAX_FEE
    ]);

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