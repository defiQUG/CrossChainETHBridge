const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RateLimiter Extended Tests", function () {
  let rateLimiter;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const RateLimiter = await ethers.getContractFactory("RateLimiter");
    rateLimiter = await RateLimiter.deploy();
    await rateLimiter.deployed();
  });

  describe("Period Management", function () {
    it("Should correctly handle period transitions", async function () {
      const amount = ethers.utils.parseEther("1.0");
      await rateLimiter.checkAndUpdateRateLimit(amount);

      // Move time forward to next period
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");

      // This should work as it's a new period
      await expect(
        rateLimiter.checkAndUpdateRateLimit(amount)
      ).to.not.be.reverted;

      // Verify period usage
      const currentPeriod = Math.floor(Date.now() / 1000 / 3600);
      const usage = await rateLimiter.periodUsage(currentPeriod);
      expect(usage).to.equal(amount);
    });

    it("Should handle multiple transactions in same period", async function () {
      const amount = ethers.utils.parseEther("1.0");
      await rateLimiter.checkAndUpdateRateLimit(amount);
      await rateLimiter.checkAndUpdateRateLimit(amount);

      const currentPeriod = Math.floor(Date.now() / 1000 / 3600);
      const usage = await rateLimiter.periodUsage(currentPeriod);
      expect(usage).to.equal(amount.mul(2));
    });
  });

  describe("Emergency Controls", function () {
    it("Should handle emergency pause correctly", async function () {
      await rateLimiter.pause();
      const amount = ethers.utils.parseEther("1.0");
      await expect(
        rateLimiter.checkAndUpdateRateLimit(amount)
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should prevent non-owner from pausing", async function () {
      await expect(
        rateLimiter.connect(addr1).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Rate Limit Validation", function () {
    it("Should enforce hourly rate limit", async function () {
      const amount = ethers.utils.parseEther("5.0");
      await rateLimiter.checkAndUpdateRateLimit(amount);

      // This should exceed the rate limit
      await expect(
        rateLimiter.checkAndUpdateRateLimit(amount)
      ).to.be.revertedWith("Rate limit exceeded");
    });
  });
});
