const { ethers } = require('hardhat');
const { expect } = require('chai');
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { deployTestContracts } = require('./helpers/setup');

const {
    MAX_MESSAGES_PER_PERIOD,
    PERIOD_DURATION
} = require('./helpers/setup').TEST_CONFIG;

describe("RateLimiter Extended Tests", function () {
    let rateLimiter;
    let owner;
    let addr1;
    const MAX_MESSAGES = MAX_MESSAGES_PER_PERIOD;
    const RATE_PERIOD = PERIOD_DURATION;

    beforeEach(async function () {
        const contracts = await deployTestContracts();
        rateLimiter = contracts.rateLimiter;
        [owner, addr1] = await ethers.getSigners();
    });

    describe("Period Management", function () {
        it("Should correctly handle period transitions", async function () {
            await rateLimiter.processMessage();
            // Move time forward to next period
            await time.increase(RATE_PERIOD);
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

    describe("Rate Limit Validation", function () {
        it("Should enforce hourly rate limit", async function () {
            for (let i = 0; i < MAX_MESSAGES; i++) {
                await rateLimiter.processMessage();
            }
            await expect(rateLimiter.processMessage())
                .to.be.revertedWithCustomError(rateLimiter, "RateLimitExceeded");
        });

        it("Should handle rate limit updates", async function () {
            await rateLimiter.setRateLimit(2, RATE_PERIOD);
            await rateLimiter.processMessage();
            await rateLimiter.processMessage();
            await expect(rateLimiter.processMessage())
                .to.be.revertedWithCustomError(rateLimiter, "RateLimitExceeded");
        });

        it("Should prevent non-owner from updating rate limit", async function () {
            await expect(
                rateLimiter.connect(addr1).setRateLimit(10, RATE_PERIOD)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});
