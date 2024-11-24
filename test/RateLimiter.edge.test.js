const { ethers } = require('hardhat');
const { expect } = require('chai');
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { deployTestContracts } = require('./helpers/setup');

const {
    MAX_MESSAGES_PER_PERIOD,
    PERIOD_DURATION
} = require('./helpers/setup').TEST_CONFIG;

describe("RateLimiter Edge Cases", function () {
    let rateLimiter;
    let owner;
    let user;
    const MAX_MESSAGES = MAX_MESSAGES_PER_PERIOD;
    const RATE_PERIOD = PERIOD_DURATION;

    beforeEach(async function () {
        const contracts = await deployTestContracts();
        rateLimiter = contracts.rateLimiter;
        [owner, user] = await ethers.getSigners();
    });

    describe("Period Boundary Tests", function () {
        it("Should handle messages at period boundaries", async function () {
            // Process messages up to limit
            for (let i = 0; i < MAX_MESSAGES; i++) {
                await rateLimiter.processMessage();
            }

            // Advance time to just before period end
            await time.increase(RATE_PERIOD - 2);

            // Should still be rate limited
            await expect(rateLimiter.processMessage())
                .to.be.revertedWith("SecurityBase: Rate limit exceeded");

            // Advance time to just after period end
            await time.increase(3);

            // Should allow message in new period
            await expect(rateLimiter.processMessage()).to.not.be.reverted;
        });

        it("Should handle rapid period transitions", async function () {
            // Process messages in multiple consecutive periods
            for (let period = 0; period < 3; period++) {
                for (let msg = 0; msg < MAX_MESSAGES; msg++) {
                    await rateLimiter.processMessage();
                }
                await time.increase(RATE_PERIOD);
            }
            // Verify current period can process messages
            await expect(rateLimiter.processMessage()).to.not.be.reverted;
        });
    });

    describe("Rate Update Edge Cases", function () {
        it("Should handle rate updates during active period", async function () {
            // Process some messages
            await rateLimiter.processMessage();

            // Update rate limit mid-period
            const newMax = MAX_MESSAGES - 2;
            await rateLimiter.setRateLimit(newMax, RATE_PERIOD);

            // Process up to new limit
            for (let i = 0; i < newMax - 1; i++) {
                await rateLimiter.processMessage();
            }

            // Should enforce new limit immediately
            await expect(rateLimiter.processMessage())
                .to.be.revertedWith("SecurityBase: Rate limit exceeded");
        });

        it("Should handle multiple rate updates in quick succession", async function () {
            // Multiple rate updates
            for (let i = 2; i <= 5; i++) {
                await rateLimiter.setRateLimit(i, RATE_PERIOD);
            }

            // Process messages up to final limit
            for (let i = 0; i < 5; i++) {
                await rateLimiter.processMessage();
            }

            // Should enforce latest limit
            await expect(rateLimiter.processMessage())
                .to.be.revertedWith("SecurityBase: Rate limit exceeded");
        });
    });
});
