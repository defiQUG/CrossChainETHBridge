const { ethers } = require('hardhat');
const { expect } = require('chai');
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { deployTestContracts, TEST_CONFIG } = require('./helpers/setup');
const { deployContract, getContractAt } = require('./helpers/test-utils');

const {
    BRIDGE_FEE,
    MAX_FEE,
    MAX_MESSAGES_PER_PERIOD,
    PAUSE_THRESHOLD,
    PAUSE_DURATION,
    POLYGON_CHAIN_SELECTOR,
    DEFI_ORACLE_META_CHAIN_SELECTOR
} = TEST_CONFIG;
describe("RateLimiter Edge Cases", function () {
    let rateLimiter;
    let owner;
    let user;
    const MAX_MESSAGES = 5;
    const RATE_PERIOD = 3600; // 1 hour in seconds

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();
        const RateLimiter = await ethers.getContractFactory("contracts/security/RateLimiter.sol:RateLimiter");
        rateLimiter = await RateLimiter.deploy(MAX_MESSAGES, RATE_PERIOD);
        await rateLimiter.waitForDeployment();
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
                .to.be.revertedWith("Rate limit exceeded for current period");

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
            await rateLimiter.setMaxMessagesPerPeriod(newMax);

            // Process up to new limit
            for (let i = 0; i < newMax - 1; i++) {
                await rateLimiter.processMessage();
            }

            // Should enforce new limit immediately
            await expect(rateLimiter.processMessage())
                .to.be.revertedWith("Rate limit exceeded for current period");
        });

        it("Should handle multiple rate updates in quick succession", async function () {
            // Multiple rate updates
            for (let i = 2; i <= 5; i++) {
                await rateLimiter.setMaxMessagesPerPeriod(i);
            }

            // Process messages up to final limit
            for (let i = 0; i < 5; i++) {
                await rateLimiter.processMessage();
            }

            // Should enforce latest limit
            await expect(rateLimiter.processMessage())
                .to.be.revertedWith("Rate limit exceeded for current period");
        });
    });
});
