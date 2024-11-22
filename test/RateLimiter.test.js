const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RateLimiter", function () {
    let RateLimiter;
    let rateLimiter;
    let owner;
    let addr1;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();
        RateLimiter = await ethers.getContractFactory("RateLimiter");
        rateLimiter = await RateLimiter.deploy(100);
        await rateLimiter.deployed();
    });

    describe("Rate Limiting", function () {
        it("Should allow messages within rate limit", async function () {
            await expect(rateLimiter.processMessage())
                .to.emit(rateLimiter, "MessageProcessed");

            const currentPeriod = await rateLimiter.getCurrentPeriod();
            expect(await rateLimiter.messageCountByPeriod(currentPeriod)).to.equal(1);
        });

        it("Should enforce rate limit", async function () {
            const maxMessages = await rateLimiter.maxMessagesPerPeriod();

            for (let i = 0; i < maxMessages; i++) {
                await rateLimiter.processMessage();
            }

            await expect(rateLimiter.processMessage())
                .to.be.revertedWith("Rate limit exceeded for current period");
        });
    });

    describe("Emergency Controls", function () {
        it("Should allow owner to pause and unpause", async function () {
            await rateLimiter.emergencyPause();
            expect(await rateLimiter.paused()).to.be.true;

            await expect(rateLimiter.processMessage())
                .to.be.revertedWith("Pausable: paused");

            await rateLimiter.emergencyUnpause();
            expect(await rateLimiter.paused()).to.be.false;

            await expect(rateLimiter.processMessage())
                .to.emit(rateLimiter, "MessageProcessed");
        });
    });
});
