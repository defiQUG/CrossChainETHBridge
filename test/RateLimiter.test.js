const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("RateLimiter", function() {
    let owner, user1, user2;
    let rateLimiter;
    const MAX_MESSAGES_PER_PERIOD = 5;
    const PERIOD_LENGTH = 3600; // 1 hour in seconds

    beforeEach(async function() {
        [owner, user1, user2] = await ethers.getSigners();
        const RateLimiter = await ethers.getContractFactory("RateLimiter");
        rateLimiter = await RateLimiter.deploy(MAX_MESSAGES_PER_PERIOD, PERIOD_LENGTH);
        await rateLimiter.waitForDeployment();
    });

    describe("Rate Limiting", function() {
        it("Should allow messages within rate limit", async function() {
            // Send MAX_MESSAGES_PER_PERIOD messages
            for (let i = 0; i < MAX_MESSAGES_PER_PERIOD; i++) {
                await rateLimiter.checkAndUpdateRateLimit();
            }
            // The next message should fail
            await expect(rateLimiter.checkAndUpdateRateLimit())
                .to.be.revertedWith("Rate limit exceeded");
        });
    });
});
