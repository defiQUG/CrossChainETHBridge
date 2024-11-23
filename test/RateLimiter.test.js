const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployTestContracts } = require("./helpers/TestSetup");

describe("RateLimiter", function () {
    let rateLimiter;
    let owner;
    let user;
    const MAX_MESSAGES = 10;
    const PERIOD_DURATION = 3600; // 1 hour

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();
        const contracts = await deployTestContracts();
        rateLimiter = contracts.rateLimiter;
    });

    describe("Rate Limiting", function () {
        it("Should allow messages within rate limit", async function () {
            for (let i = 0; i < 5; i++) {
                await rateLimiter.connect(user).processMessage();
                const messageCount = await rateLimiter.getCurrentPeriodMessages();
                expect(messageCount).to.equal(i + 1);
            }
        });

        it("Should reject messages exceeding rate limit", async function () {
            for (let i = 0; i < MAX_MESSAGES; i++) {
                await rateLimiter.connect(user).processMessage();
            }
            await expect(rateLimiter.connect(user).processMessage())
                .to.be.revertedWith("RateLimiter: rate limit exceeded");
        });

        it("Should reset period after duration", async function () {
            // Process messages up to limit
            for (let i = 0; i < MAX_MESSAGES; i++) {
                await rateLimiter.connect(user).processMessage();
            }

            // Move time forward past period duration
            await ethers.provider.send("evm_increaseTime", [PERIOD_DURATION + 1]);
            await ethers.provider.send("evm_mine");

            // Should allow messages in new period
            await rateLimiter.connect(user).processMessage();
            const messageCount = await rateLimiter.getCurrentPeriodMessages();
            expect(messageCount).to.equal(1);
        });

        it("Should allow owner to update rate limit", async function () {
            const newMax = 20;
            const newPeriod = 7200;

            await rateLimiter.connect(owner).setRateLimit(newMax, newPeriod);

            expect(await rateLimiter.getMaxMessagesPerPeriod()).to.equal(newMax);
            expect(await rateLimiter.getPeriodDuration()).to.equal(newPeriod);
        });

        it("Should not allow non-owner to update rate limit", async function () {
            await expect(rateLimiter.connect(user).setRateLimit(20, 7200))
                .to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});
