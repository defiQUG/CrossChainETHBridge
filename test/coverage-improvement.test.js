const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Coverage Improvement Tests", function () {
  let messenger, router, weth, owner, user1, user2;
  const RATE_PERIOD = 3600; // 1 hour in seconds
  const MAX_MESSAGES = 5;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const MockRouter = await ethers.getContractFactory("MockRouter");
    router = await MockRouter.deploy();
    await router.deployed();

    const MockWETH = await ethers.getContractFactory("MockWETH");
    weth = await MockWETH.deploy("Wrapped Ether", "WETH");
    await weth.deployed();

    const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
    messenger = await CrossChainMessenger.deploy(router.address, weth.address, MAX_MESSAGES);
    await messenger.deployed();
  });

  describe("MockWETH", function () {
    it("Should handle deposit and withdrawal correctly", async function () {
      const depositAmount = ethers.utils.parseEther("1.0");
      await weth.deposit({ value: depositAmount });
      expect(await weth.balanceOf(owner.address)).to.equal(depositAmount);

      await weth.withdraw(depositAmount);
      expect(await weth.balanceOf(owner.address)).to.equal(0);
    });

    it("Should handle transfer correctly", async function () {
      const amount = ethers.utils.parseEther("1.0");
      await weth.deposit({ value: amount });
      await weth.transfer(user1.address, amount);
      expect(await weth.balanceOf(user1.address)).to.equal(amount);
    });
  });

  describe("RateLimiter Edge Cases", function () {
    it("Should handle multiple messages within same period", async function () {
      for (let i = 0; i < MAX_MESSAGES; i++) {
        await messenger.sendToPolygon(user1.address, { value: ethers.utils.parseEther("1.0") });
      }
      await expect(
        messenger.sendToPolygon(user1.address, { value: ethers.utils.parseEther("1.0") })
      ).to.be.revertedWith("Rate limit exceeded for current period");
    });
  });

  describe("Emergency Controls", function () {
    it("Should handle emergency withdraw correctly", async function () {
      const amount = ethers.utils.parseEther("5.0");
      await messenger.sendToPolygon(user1.address, { value: amount });

      const initialBalance = await ethers.provider.getBalance(user2.address);
      await messenger.emergencyWithdraw(user2.address);
      const finalBalance = await ethers.provider.getBalance(user2.address);

      expect(finalBalance.sub(initialBalance)).to.equal(amount);
    });

    it("Should prevent emergency withdraw to zero address", async function () {
      await expect(
        messenger.emergencyWithdraw(ethers.constants.AddressZero)
      ).to.be.revertedWith("Invalid recipient");
    });
  });

  describe("MockRouter", function () {
    it("Should handle ccipSend correctly", async function () {
      const amount = ethers.utils.parseEther("1.0");
      await messenger.sendToPolygon(user1.address, { value: amount });

      const events = await router.queryFilter(router.filters.MessageSent());
      expect(events.length).to.be.above(0);
    });
  });
});
