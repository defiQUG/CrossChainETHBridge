const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("RateLimiter Edge Cases", function () {
  let rateLimiter;
  let owner;
  let user;
  const MAX_MESSAGES = 5;
  const PERIOD_DURATION = 3600; // 1 hour

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const RateLimiter = await ethers.getContractFactory("RateLimiter");
    rateLimiter = await RateLimiter.deploy(MAX_MESSAGES, PERIOD_DURATION);
    await rateLimiter.deployed();
  });

  describe("Period Boundary Tests", function () {
    it("Should handle messages at period boundaries", async function () {
      // Process messages up to limit
      for (let i = 0; i < MAX_MESSAGES; i++) {
        await rateLimiter.processMessage();
      }

      // Advance time to just before period end
      await time.increase(PERIOD_DURATION - 2);

      // Should still be rate limited
      await expect(rateLimiter.processMessage())
        .to.be.revertedWithCustomError(rateLimiter, "RateLimitExceeded");

      // Advance time to just after period end
      await time.increase(3);

      // Should allow message in new period
      await expect(rateLimiter.processMessage())
        .to.not.be.reverted;
    });

    it("Should handle rapid period transitions", async function () {
      // Process messages in multiple consecutive periods
      for (let period = 0; period < 3; period++) {
        for (let msg = 0; msg < MAX_MESSAGES; msg++) {
          await rateLimiter.processMessage();
        }
        await time.increase(PERIOD_DURATION);
      }

      // Verify period stats are correct
      const [remaining, timeLeft] = await rateLimiter.getPeriodStats();
      expect(remaining).to.equal(MAX_MESSAGES - 1);
    });
  });

  describe("Rate Update Edge Cases", function () {
    it("Should handle rate updates during active period", async function () {
      // Process some messages
      await rateLimiter.processMessage();
      await rateLimiter.processMessage();

      // Update rate limit mid-period
      const newMax = MAX_MESSAGES - 2;
      await rateLimiter.updateRateLimit(newMax, PERIOD_DURATION);

      // Should enforce new limit immediately
      await expect(rateLimiter.processMessage())
        .to.be.revertedWithCustomError(rateLimiter, "RateLimitExceeded");
    });

    it("Should handle multiple rate updates in quick succession", async function () {
      for (let i = 2; i <= 5; i++) {
        await rateLimiter.updateRateLimit(i, PERIOD_DURATION);
      }

      // Process messages up to new limit
      for (let i = 0; i < 5; i++) {
        await rateLimiter.processMessage();
      }

      await expect(rateLimiter.processMessage())
        .to.be.revertedWithCustomError(rateLimiter, "RateLimitExceeded");
    });
  });
});
