const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RateLimiter", function () {
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

  describe("Rate Limiting", function () {
    it("Should allow messages within rate limit", async function () {
      await expect(rateLimiter.processMessage()).to.not.be.reverted;
    });

    it("Should enforce rate limit", async function () {
      for (let i = 0; i < MAX_MESSAGES; i++) {
        await rateLimiter.processMessage();
      }
      await expect(rateLimiter.processMessage()).to.be.revertedWith("Rate limit exceeded for current period");
    });
  });

  describe("Emergency Controls", function () {
    it("Should allow owner to pause and unpause", async function () {
      await rateLimiter.emergencyPause();
      expect(await rateLimiter.paused()).to.be.true;
      await rateLimiter.emergencyUnpause();
      expect(await rateLimiter.paused()).to.be.false;
    });
  });
});
