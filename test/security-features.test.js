const { ethers } = require('hardhat');
const { expect } = require('chai');
const { deployTestContracts, TEST_CONFIG } = require('./helpers/setup');
const { deployContract, getContractAt } = require('./helpers/test-utils');

const {
    BRIDGE_FEE,
    MAX_FEE,
    MAX_MESSAGES_PER_PERIOD,
    PAUSE_THRESHOLD,
    PAUSE_DURATION,
    POLYGON_CHAIN_SELECTOR,
    DEFI_ORACLE_META_CHAIN_SELECTOR
} = TEST_CONFIG;
describe("Security Features", function() {
  let crossChainMessenger;
  let owner;
  let user;
  let router;
  let weth;
  beforeEach(async function() {
    const contracts = await deployTestContracts();
    owner = contracts.owner;
    user = contracts.user;
    addr1 = contracts.addr1;
    addr2 = contracts.addr2;
    mockRouter = contracts.mockRouter;
    mockWETH = contracts.mockWETH;
    crossChainMessenger = contracts.crossChainMessenger;
    [owner, user] = await ethers.getSigners();
    const MockRouter = await ethers.getContractFactory("MockRouter");
    router = await MockRouter.deploy();
    const MockWETH = await ethers.getContractFactory("MockWETH");
    weth = await MockWETH.deploy();
    const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
    crossChainMessenger = await CrossChainMessenger.deploy(
      router.address,
      weth.address,
      ethers.parseUnits("10", "ether"),  // Max 10 ETH per period
      ethers.parseUnits("100", "ether"), // Pause threshold 100 ETH
      86400 // 24 hour pause duration
    );
  });
  describe("Rate Limiting", function() {
    it("Should enforce rate limits", async function() {
      const amount = ethers.parseUnits("11", "ether");
      await expect(
        crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount })
      ).to.be.revertedWith("CrossChainMessenger: rate limit exceeded");
    });
    it("Should reset rate limit after period", async function() {
      const amount = ethers.parseUnits("5", "ether");
      await crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount });
      await time.increase(3601); // Advance time by more than 1 hour
      ).to.not.be.reverted;
  describe("Emergency Pause", function() {
    it("Should pause on large transfers", async function() {
      const amount = ethers.parseUnits("101", "ether");
      ).to.be.revertedWith("CrossChainMessenger: contract is paused");
    it("Should auto-unpause after duration", async function() {
      await time.increase(86401); // Advance time by more than 24 hours
      const smallAmount = ethers.parseUnits("1", "ether");
        crossChainMessenger.connect(user).sendToPolygon(user.address, { value: smallAmount })
});
