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

describe("RateLimiter", function() {
    let owner, user1, user2;
    let rateLimiter;
    const MAX_MESSAGES = 5n;
    const PERIOD_LENGTH = 3600n; // 1 hour in seconds

    beforeEach(async function() {
        [owner, user1, user2] = await ethers.getSigners();
        const RateLimiter = await ethers.getContractFactory("RateLimiter");
        rateLimiter = await RateLimiter.deploy(MAX_MESSAGES, PERIOD_LENGTH);
        await rateLimiter.waitForDeployment();
    });

    describe("Rate Limiting", function() {
        it("Should allow messages within rate limit", async function() {
            for (let i = 0; i < Number(MAX_MESSAGES); i++) {
                const tx = await rateLimiter.processMessage();
                const receipt = await tx.wait();
                const block = await ethers.provider.getBlock(receipt.blockNumber);
                await expect(tx)
                    .to.emit(rateLimiter, "MessageProcessed")
                    .withArgs(owner.address, block.timestamp);
            }
            await expect(rateLimiter.processMessage())
                .to.be.revertedWith("Rate limit exceeded");
        });

        it("Should reset counter after period expires", async function() {
            // Use up all messages
            for (let i = 0; i < Number(MAX_MESSAGES); i++) {
                await rateLimiter.processMessage();
            }
            // Advance time by period length
            await time.increase(Number(PERIOD_LENGTH) + 1);
            // Should be able to send messages again
            await expect(rateLimiter.processMessage())
                .to.emit(rateLimiter, "PeriodReset");
            expect(await rateLimiter.getCurrentPeriodMessages()).to.equal(1n);
        });

        it("Should track message count correctly", async function() {
            for (let i = 0; i < 3; i++) {
                await rateLimiter.processMessage();
            }
            expect(await rateLimiter.getCurrentPeriodMessages()).to.equal(3n);
            expect(await rateLimiter.getRemainingMessages()).to.equal(MAX_MESSAGES - 3n);
        });
    });

    describe("Admin Functions", function() {
        it("Should allow owner to update rate limit parameters", async function() {
            const newMaxMessages = 10n;
            const newPeriodLength = 7200n;
            await expect(rateLimiter.setRateLimit(newMaxMessages, newPeriodLength))
                .to.emit(rateLimiter, "RateLimitUpdated")
                .withArgs(newMaxMessages, newPeriodLength);

            expect(await rateLimiter.maxMessagesPerPeriod()).to.equal(newMaxMessages);
            expect(await rateLimiter.periodDuration()).to.equal(newPeriodLength);
        });

        it("Should prevent non-owners from updating parameters", async function() {
            await expect(rateLimiter.connect(user1).setRateLimit(10n, PERIOD_LENGTH))
                .to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should validate rate limit parameters", async function() {
            await expect(rateLimiter.setRateLimit(0n, PERIOD_LENGTH))
                .to.be.revertedWith("Max messages must be positive");
            await expect(rateLimiter.setRateLimit(MAX_MESSAGES, 0n))
                .to.be.revertedWith("Period duration must be positive");
        });
    });
});
