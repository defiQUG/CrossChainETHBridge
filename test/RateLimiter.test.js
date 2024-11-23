const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RateLimiter", function () {
  let rateLimiter;
  let owner;
  let user;
  const MAX_MESSAGES = 10;
  const PERIOD_DURATION = 3600; // 1 hour

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const RateLimiter = await ethers.getContractFactory("RateLimiter");
    rateLimiter = await RateLimiter.deploy(MAX_MESSAGES, PERIOD_DURATION);
    await rateLimiter.waitForDeployment();
  });

  describe("Rate Limiting", function () {
    it("Should allow messages within rate limit", async function () {
      for (let i = 0; i < MAX_MESSAGES; i++) {
        await expect(rateLimiter.connect(user).processMessage())
          .to.emit(rateLimiter, "MessageProcessed")
          .withArgs(user.address, await ethers.provider.getBlock("latest").then(b => b.timestamp));
      }
    });

    it("Should reject messages exceeding rate limit", async function () {
      for (let i = 0; i < MAX_MESSAGES; i++) {
        await rateLimiter.connect(user).processMessage();
      }
      await expect(rateLimiter.connect(user).processMessage())
        .to.be.revertedWith("Rate limit exceeded");
    });

    it("Should reset period after duration", async function () {
      for (let i = 0; i < MAX_MESSAGES; i++) {
        await rateLimiter.connect(user).processMessage();
      }

      // Move time forward past period duration
      await ethers.provider.send("evm_increaseTime", [PERIOD_DURATION + 1]);
      await ethers.provider.send("evm_mine");

      // Should allow messages in new period
      await expect(rateLimiter.connect(user).processMessage())
        .to.emit(rateLimiter, "MessageProcessed");
    });

    it("Should allow owner to update rate limit", async function () {
      const newMax = 20;
      const newPeriod = 7200;

      await expect(rateLimiter.connect(owner).setRateLimit(newMax, newPeriod))
        .to.emit(rateLimiter, "RateLimitUpdated")
        .withArgs(newMax, newPeriod);

      expect(await rateLimiter.maxMessagesPerPeriod()).to.equal(newMax);
      expect(await rateLimiter.periodDuration()).to.equal(newPeriod);
    });

    it("Should not allow non-owner to update rate limit", async function () {
      await expect(rateLimiter.connect(user).setRateLimit(20, 7200))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
