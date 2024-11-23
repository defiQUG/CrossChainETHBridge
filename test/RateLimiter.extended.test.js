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

describe("RateLimiter Extended Tests", function () {
    let rateLimiter;
    let owner;
    let addr1;
    const MAX_MESSAGES = 5;
    const RATE_PERIOD = 3600; // 1 hour in seconds

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();
        const RateLimiter = await ethers.getContractFactory("contracts/security/RateLimiter.sol:RateLimiter");
        rateLimiter = await RateLimiter.deploy(MAX_MESSAGES, RATE_PERIOD);
        await rateLimiter.waitForDeployment();
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

    describe("Emergency Controls", function () {
        it("Should handle emergency pause correctly", async function () {
            await rateLimiter.emergencyPause();
            await expect(rateLimiter.processMessage())
                .to.be.revertedWith("Pausable: paused");
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
            await expect(rateLimiter.processMessage())
                .to.be.revertedWith("Rate limit exceeded");
        });

        it("Should handle rate limit updates", async function () {
            await rateLimiter.setMaxMessagesPerPeriod(2);
            await rateLimiter.processMessage();
            await rateLimiter.processMessage();
            await expect(rateLimiter.processMessage())
                .to.be.revertedWith("Rate limit exceeded");
        });

        it("Should prevent non-owner from updating rate limit", async function () {
            await expect(
                rateLimiter.connect(addr1).setMaxMessagesPerPeriod(10)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});
