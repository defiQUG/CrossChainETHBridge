const { ethers } = require('hardhat');

async function deployTestContracts() {
    const [owner, user, addr1, addr2] = await ethers.getSigners();

    // Deploy mock WETH
    const MockWETH = await ethers.getContractFactory('MockWETH');
    const mockWETH = await MockWETH.deploy("Wrapped Ether", "WETH");
    await mockWETH.deployed();

    // Deploy RateLimiter with constructor arguments
    const RateLimiter = await ethers.getContractFactory('RateLimiter');
    const rateLimiter = await RateLimiter.deploy(10, 3600); // 10 messages per hour
    await rateLimiter.deployed();

    // Deploy EmergencyPause
    const EmergencyPause = await ethers.getContractFactory('EmergencyPause');
    const emergencyPause = await EmergencyPause.deploy(
        ethers.utils.parseEther('100'), // 100 ETH threshold
        3600 // 1 hour pause duration
    );
    await emergencyPause.deployed();

    // Deploy TestRouter (concrete implementation of MockRouter)
    const TestRouter = await ethers.getContractFactory('TestRouter');
    const mockRouter = await TestRouter.deploy(10, 3600); // 10 messages per hour
    await mockRouter.deployed();

    // Initialize TestRouter with configuration (removed rate limiter initialization)
    await mockRouter.initialize(
        owner.address, // admin
        mockWETH.address, // fee token
        ethers.utils.parseEther('0.001') // base fee
    );

    // Deploy CrossChainMessenger
    const CrossChainMessenger = await ethers.getContractFactory('CrossChainMessenger');
    const messenger = await CrossChainMessenger.deploy(
        mockRouter.address,
        mockWETH.address,
        rateLimiter.address,
        emergencyPause.address,
        ethers.utils.parseEther('0.001'), // 0.001 ETH bridge fee
        ethers.utils.parseEther('1') // 1 ETH max fee
    );
    await messenger.deployed();

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
