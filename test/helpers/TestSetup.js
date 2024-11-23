const { ethers } = require('hardhat');

async function deployTestContracts() {
    const [owner, user, addr1, addr2] = await ethers.getSigners();

    // Deploy mock WETH
    const MockWETH = await ethers.getContractFactory('MockWETH');
    const mockWETH = await MockWETH.deploy();
    await mockWETH.waitForDeployment();

    // Deploy RateLimiter with constructor parameters
    const RateLimiter = await ethers.getContractFactory('RateLimiter');
    const rateLimiter = await RateLimiter.deploy(
        10, // maxMessagesPerPeriod
        3600 // periodDuration
    );
    await rateLimiter.waitForDeployment();

    // Deploy EmergencyPause
    const EmergencyPause = await ethers.getContractFactory('EmergencyPause');
    const emergencyPause = await EmergencyPause.deploy(
        ethers.parseEther('100'), // 100 ETH threshold
        3600 // 1 hour pause duration
    );
    await emergencyPause.waitForDeployment();

    // Deploy TestRouter (concrete implementation of MockRouter)
    const TestRouter = await ethers.getContractFactory('TestRouter');
    const mockRouter = await TestRouter.deploy(
        138, // DEFI_ORACLE_META_CHAIN_SELECTOR
        137  // POLYGON_CHAIN_SELECTOR
    );
    await mockRouter.waitForDeployment();

    // Deploy CrossChainMessenger
    const CrossChainMessenger = await ethers.getContractFactory('CrossChainMessenger');
    const messenger = await CrossChainMessenger.deploy(
        await mockRouter.getAddress(),
        await mockWETH.getAddress(),
        await rateLimiter.getAddress(),
        await emergencyPause.getAddress(),
        ethers.parseEther('0.001'), // 0.001 ETH bridge fee
        ethers.parseEther('1') // 1 ETH max fee
    );
    await messenger.waitForDeployment();

    return {
        owner,
        user,
        addr1,
        addr2,
        mockWETH,
        rateLimiter,
        emergencyPause,
        mockRouter,
        messenger
    };
}

module.exports = {
    deployTestContracts
};
