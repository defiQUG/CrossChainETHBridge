const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RateLimiter Extended Tests", function () {
  let rateLimiter;
  let owner;
  let addr1;
  const MAX_MESSAGES = 5;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const RateLimiter = await ethers.getContractFactory("RateLimiter");
    rateLimiter = await RateLimiter.deploy(MAX_MESSAGES);
    await rateLimiter.deployed();
  });

  describe("Period Management", function () {
    it("Should correctly handle period transitions", async function () {
      await rateLimiter.processMessage();

      // Move time forward to next period
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");

      // This should work as it's a new period
      await expect(rateLimiter.processMessage()).to.not.be.reverted;

      // Verify period usage
      const currentPeriod = await rateLimiter.getCurrentPeriod();
      const usage = await rateLimiter.messageCountByPeriod(currentPeriod);
      expect(usage).to.equal(1);
    });

    it("Should handle multiple transactions in same period", async function () {
      await rateLimiter.processMessage();
      await rateLimiter.processMessage();

      const currentPeriod = await rateLimiter.getCurrentPeriod();
      const usage = await rateLimiter.messageCountByPeriod(currentPeriod);
      expect(usage).to.equal(2);
    });
  });

  describe("Emergency Controls", function () {
    it("Should handle emergency pause correctly", async function () {
      await rateLimiter.emergencyPause();
      await expect(rateLimiter.processMessage()).to.be.revertedWith("Pausable: paused");
    });

    it("Should prevent non-owner from pausing", async function () {
      await expect(
        rateLimiter.connect(addr1).emergencyPause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Rate Limit Validation", function () {
    it("Should enforce hourly rate limit", async function () {
      for (let i = 0; i < MAX_MESSAGES; i++) {
        await rateLimiter.processMessage();
      }
      await expect(rateLimiter.processMessage()).to.be.revertedWith("Rate limit exceeded for current period");
    });
  });
});
