const { deployTestContracts, TEST_CONFIG } = require("./helpers/setup");
const { expect } = require("./setup");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

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
      await expect(
        crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount })
      ).to.not.be.reverted;
    });
  });

  describe("Emergency Pause", function() {
    it("Should pause on large transfers", async function() {
      const amount = ethers.parseUnits("101", "ether");
      await expect(
        crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount })
      ).to.be.revertedWith("CrossChainMessenger: contract is paused");
    });

    it("Should auto-unpause after duration", async function() {
      const amount = ethers.parseUnits("101", "ether");
      await crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount });
      await time.increase(86401); // Advance time by more than 24 hours
      const smallAmount = ethers.parseUnits("1", "ether");
      await expect(
        crossChainMessenger.connect(user).sendToPolygon(user.address, { value: smallAmount })
      ).to.not.be.reverted;
    });
  });
});
