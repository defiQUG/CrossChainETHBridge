const { ethers, deployContract, expect, getSigners } = require("./setup");

describe("EmergencyPause", function() {
    let owner, user1;
    let emergencyPause;
    const PAUSE_THRESHOLD = ethers.parseEther("5.0");
    const PAUSE_DURATION = 3600; // 1 hour

    beforeEach(async function() {
        ({ owner, user1 } = await getSigners());
        emergencyPause = await deployContract("EmergencyPause", [PAUSE_THRESHOLD, PAUSE_DURATION]);
    });

    describe("Pause Functionality", function() {
        it("Should automatically pause when threshold is exceeded", async function() {
            await emergencyPause._checkAndPause(PAUSE_THRESHOLD);
            expect(await emergencyPause.isPaused()).to.be.true;
        });

        it("Should not pause when amount is below threshold", async function() {
            await emergencyPause._checkAndPause(ethers.parseEther("1.0"));
            expect(await emergencyPause.isPaused()).to.be.false;
        });

        it("Should return correct time until unpause", async function() {
            await emergencyPause._checkAndPause(PAUSE_THRESHOLD);
            const timeUntil = await emergencyPause.timeUntilUnpause();
            expect(timeUntil).to.be.closeTo(PAUSE_DURATION, 5); // Allow 5 seconds deviation
        });

        it("Should allow unpause after duration", async function() {
            await emergencyPause._checkAndPause(PAUSE_THRESHOLD);
            await ethers.provider.send("evm_increaseTime", [PAUSE_DURATION + 1]);
            await ethers.provider.send("evm_mine");
            await emergencyPause._attemptUnpause();
            expect(await emergencyPause.isPaused()).to.be.false;
        });

        it("Should not unpause before duration", async function() {
            await emergencyPause._checkAndPause(PAUSE_THRESHOLD);
            await ethers.provider.send("evm_increaseTime", [PAUSE_DURATION - 100]);
            await ethers.provider.send("evm_mine");
            await emergencyPause._attemptUnpause();
            expect(await emergencyPause.isPaused()).to.be.true;
        });
    });
});
