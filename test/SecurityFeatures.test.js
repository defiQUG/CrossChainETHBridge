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
            await rateLimiter.checkAndUpdateRateLimit();

            // Attempt to exceed rate limit
            for(let i = 0; i < 10; i++) {
                if(i < 9) {
                    await rateLimiter.checkAndUpdateRateLimit();
                } else {
                    await expect(rateLimiter.checkAndUpdateRateLimit())
                        .to.be.revertedWith("Rate limit exceeded");
                }
            }
        });

        it("Should reset rate limit after period", async function() {
            // Fill up the rate limit
            for(let i = 0; i < 9; i++) {
                await rateLimiter.checkAndUpdateRateLimit();
            }

            // Wait for rate limit period to pass
            await ethers.provider.send("evm_increaseTime", [3600]); // 1 hour
            await ethers.provider.send("evm_mine");

            // Should be able to process message again
            await expect(rateLimiter.checkAndUpdateRateLimit()).to.not.be.reverted;
        });
    });

    describe("Emergency Pause", function() {
        it("Should trigger emergency pause when threshold reached", async function() {
            const amount = ethers.parseEther("1.0");

            // Process messages until threshold
            for(let i = 0; i < 5; i++) {
                await emergencyPause.checkAndPause(amount);
            }

            // Next message should trigger pause
            await expect(emergencyPause.checkAndPause(amount))
                .to.emit(emergencyPause, "SecurityPaused");

            expect(await emergencyPause.paused()).to.be.true;
        });

        it("Should prevent operations when paused", async function() {
            const amount = ethers.parseEther("1.0");

            // Trigger pause
            for(let i = 0; i < 6; i++) {
                await emergencyPause.checkAndPause(amount);
            }

            // Should revert when trying to process message while paused
            await expect(emergencyPause.checkAndPause(amount))
                .to.be.revertedWith("Pausable: paused");
        });

        it("Should allow unpausing after delay", async function() {
            const amount = ethers.parseEther("1.0");

            // Trigger pause
            for(let i = 0; i < 6; i++) {
                await emergencyPause.checkAndPause(amount);
            }

            // Try to unpause immediately (should fail)
            await expect(emergencyPause.emergencyUnpause())
                .to.be.revertedWith("Emergency delay not elapsed");

            // Wait for delay
            await ethers.provider.send("evm_increaseTime", [86400]); // 24 hours
            await ethers.provider.send("evm_mine");

            // Should be able to unpause
            await expect(emergencyPause.emergencyUnpause())
                .to.emit(emergencyPause, "SecurityUnpaused");

            expect(await emergencyPause.paused()).to.be.false;
        });
    });

    describe("Integration", function() {
        it("Should integrate rate limiting with emergency pause", async function() {
            const amount = ethers.parseEther("1.0");

            // Process messages until rate limit
            for(let i = 0; i < 9; i++) {
                await rateLimiter.checkAndUpdateRateLimit();
                await emergencyPause.checkAndPause(amount);
            }

            // Rate limit should prevent further processing
            await expect(rateLimiter.checkAndUpdateRateLimit())
                .to.be.revertedWith("Rate limit exceeded");

            // Emergency pause should be triggered
            expect(await emergencyPause.paused()).to.be.true;
        });
    });
});
