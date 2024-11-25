const { ethers } = require('hardhat');

async function deployTestContracts() {
    const [owner, user, addr1, addr2] = await ethers.getSigners();

    // Deploy mock WETH
    const MockWETH = await ethers.getContractFactory('MockWETH');
    const mockWETH = await MockWETH.deploy("Wrapped Ether", "WETH");
    await mockWETH.waitForDeployment();

    // Deploy MockDefiOracle
    const MockDefiOracle = await ethers.getContractFactory('MockDefiOracle');
    const oracle = await MockDefiOracle.deploy();
    await oracle.waitForDeployment();

    // Configure oracle with test values
    await oracle.setGasFee(138, ethers.parseUnits('50', 'gwei')); // 50 gwei for Defi Oracle Meta
    await oracle.setGasFee(137, ethers.parseUnits('30', 'gwei')); // 30 gwei for Polygon
    await oracle.setGasMultiplier(138, 150); // 1.5x for Defi Oracle Meta
    await oracle.setGasMultiplier(137, 100); // 1.0x for Polygon

    // Deploy RateLimiter with constructor arguments
    const RateLimiter = await ethers.getContractFactory('RateLimiter');
    const rateLimiter = await RateLimiter.deploy(10, 3600); // 10 messages per hour
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
    const mockRouter = await TestRouter.deploy(10, 3600); // 10 messages per hour
    await mockRouter.waitForDeployment();

    // Initialize TestRouter with configuration (removed rate limiter initialization)
    await mockRouter.initialize(
        owner.address, // admin
        await mockWETH.getAddress(), // fee token
        ethers.parseEther('1.1'), // base fee - updated to match test expectations
        await oracle.getAddress() // oracle address
    );

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
        messenger,
        oracle
    };
}

module.exports = {
    deployTestContracts
};
