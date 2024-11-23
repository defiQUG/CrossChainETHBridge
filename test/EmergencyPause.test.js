const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("EmergencyPause", function() {
    let owner, user1;
    let emergencyPause;
    const PAUSE_THRESHOLD = ethers.parseEther("5.0");
    const PAUSE_DURATION = 3600; // 1 hour

    beforeEach(async function() {
        [owner, user1] = await ethers.getSigners();
        const EmergencyPause = await ethers.getContractFactory("EmergencyPause");
        emergencyPause = await EmergencyPause.deploy(PAUSE_THRESHOLD, PAUSE_DURATION);
        await emergencyPause.waitForDeployment();
    });

    describe("Pause Functionality", function() {
        it("Should automatically pause when threshold is exceeded", async function() {
            await emergencyPause.checkAndPause(PAUSE_THRESHOLD);
            expect(await emergencyPause.isPaused()).to.be.true;
        });

        it("Should not pause when amount is below threshold", async function() {
            await emergencyPause.checkAndPause(ethers.parseEther("1.0"));
            expect(await emergencyPause.isPaused()).to.be.false;
        });

        it("Should return correct time until unpause", async function() {
            await emergencyPause.checkAndPause(PAUSE_THRESHOLD);
            const timeUntil = await emergencyPause.timeUntilUnpause();
            expect(timeUntil).to.be.closeTo(PAUSE_DURATION, 5); // Allow 5 seconds deviation
        });

        it("Should allow unpause after duration", async function() {
            await emergencyPause.checkAndPause(PAUSE_THRESHOLD);
            await ethers.provider.send("evm_increaseTime", [PAUSE_DURATION + 1]);
            await ethers.provider.send("evm_mine");
            // Contract now automatically unpauses after duration
            expect(await emergencyPause.isPaused()).to.be.false;
        });

        it("Should not unpause before duration", async function() {
            await emergencyPause.checkAndPause(PAUSE_THRESHOLD);
            await ethers.provider.send("evm_increaseTime", [PAUSE_DURATION - 100]);
            await ethers.provider.send("evm_mine");
            // Contract should still be paused
            expect(await emergencyPause.isPaused()).to.be.true;
        });
    });
});
