const { ethers } = require('hardhat');
const { expect } = require('chai');
const { deployTestContracts, TEST_CONFIG } = require('./helpers/setup');
const { deployContract } = require('./helpers/test-utils');

describe("Security Features Integration Tests", function() {
    let owner, user, addr1, addr2;
    let mockRouter, mockWETH, crossChainMessenger, rateLimiter, emergencyPause;

    beforeEach(async function() {
        const contracts = await deployTestContracts();
        owner = contracts.owner;
        user = contracts.user;
        addr1 = contracts.addr1;
        addr2 = contracts.addr2;
        mockRouter = contracts.mockRouter;
        mockWETH = contracts.mockWETH;
        crossChainMessenger = contracts.crossChainMessenger;
        rateLimiter = contracts.rateLimiter;
        emergencyPause = contracts.emergencyPause;
    });

    describe("Rate Limiting", function() {
        it("Should enforce rate limits correctly", async function() {
            const amount = ethers.parseEther("1.0");
            await rateLimiter.processMessage();

            // Attempt to exceed rate limit
            for(let i = 0; i < TEST_CONFIG.MAX_MESSAGES_PER_PERIOD; i++) {
                if(i < TEST_CONFIG.MAX_MESSAGES_PER_PERIOD - 1) {
                    await rateLimiter.processMessage();
                } else {
                    await expect(rateLimiter.processMessage())
                        .to.be.revertedWith("Rate limit exceeded");
                }
            }
        });

        it("Should reset rate limit after period", async function() {
            // Fill up the rate limit
            for(let i = 0; i < TEST_CONFIG.MAX_MESSAGES_PER_PERIOD - 1; i++) {
                await rateLimiter.processMessage();
            }

            // Wait for rate limit period to pass
            await ethers.provider.send("evm_increaseTime", [TEST_CONFIG.PERIOD_DURATION]);
            await ethers.provider.send("evm_mine");

            // Should be able to process message again
            await expect(rateLimiter.processMessage()).to.not.be.reverted;
        });
    });

    describe("Emergency Pause", function() {
        it("Should trigger emergency pause when threshold reached", async function() {
            const amount = ethers.parseEther("100.0"); // Match PAUSE_THRESHOLD

            // Get current block timestamp before the transaction
            const currentBlock = await ethers.provider.getBlock('latest');
            const expectedTimestamp = currentBlock.timestamp + 1; // Next block timestamp

            // Should trigger pause immediately as amount equals threshold
            await expect(emergencyPause.lockValue(amount))
                .to.emit(emergencyPause, "EmergencyPauseTriggered")
                .withArgs(expectedTimestamp, TEST_CONFIG.PAUSE_DURATION);

            expect(await emergencyPause.paused()).to.be.true;
        });

        it("Should prevent operations when paused", async function() {
            const amount = ethers.parseEther("100.0");

            // Trigger pause
            await emergencyPause.lockValue(amount);

            // Should revert when trying to lock value while paused
            await expect(emergencyPause.lockValue(ethers.parseEther("1.0")))
                .to.be.revertedWith("Contract is paused");
        });

        it("Should allow unpausing after delay", async function() {
            const amount = ethers.parseEther("100.0");

            // Trigger pause
            await emergencyPause.lockValue(amount);

            // Wait for pause duration
            await ethers.provider.send("evm_increaseTime", [TEST_CONFIG.PAUSE_DURATION]);
            await ethers.provider.send("evm_mine");

            // Should be able to unpause via checkAndUnpause
            await emergencyPause.checkAndUnpause();
            expect(await emergencyPause.paused()).to.be.false;
        });
    });

    describe("Integration", function() {
        it("Should integrate rate limiting with emergency pause", async function() {
            const amount = ethers.parseEther("1.0");

            // Process messages until rate limit
            for(let i = 0; i < TEST_CONFIG.MAX_MESSAGES_PER_PERIOD; i++) {
                if(i < TEST_CONFIG.MAX_MESSAGES_PER_PERIOD - 1) {
                    await rateLimiter.processMessage();
                    await emergencyPause.lockValue(amount);
                } else {
                    await expect(rateLimiter.processMessage())
                        .to.be.revertedWith("Rate limit exceeded");
                }
            }

            // Verify total value locked
            const expectedLocked = amount.mul(TEST_CONFIG.MAX_MESSAGES_PER_PERIOD - 1);
            expect(await emergencyPause.totalValueLocked()).to.equal(expectedLocked);
        });
    });
});
