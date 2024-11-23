const { ethers, deployContract, expect, getSigners } = require("./setup");

describe("RateLimiter", function() {
    let owner, user1, user2;
    let rateLimiter;
    const MAX_MESSAGES_PER_PERIOD = 5;
    const PERIOD_LENGTH = 3600; // 1 hour in seconds

    beforeEach(async function() {
        ({ owner, user1, user2 } = await getSigners());
        rateLimiter = await deployContract("RateLimiter", [MAX_MESSAGES_PER_PERIOD, PERIOD_LENGTH]);
    });

    describe("Rate Limiting", function() {
        it("Should allow messages within rate limit", async function() {
            for (let i = 0; i < MAX_MESSAGES_PER_PERIOD; i++) {
                await rateLimiter.checkAndUpdateRateLimit();
            }
            await expect(rateLimiter.checkAndUpdateRateLimit())
                .to.be.revertedWith("Rate limit exceeded");
        });
    });
});
