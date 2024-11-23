const { deployTestContracts, TEST_CONFIG } = require("./helpers/setup");
const { ethers } = require("hardhat");
const { expect } = require("chai");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("EmergencyPause", function() {
    let owner, user1;
    let emergencyPause;
    const PAUSE_THRESHOLD = ethers.parseEther("5.0");
    const PAUSE_DURATION = 3600; // 1 hour

    beforeEach(async function() {
    const contracts = await deployTestContracts();
    owner = contracts.owner;
    user = contracts.user;
    addr1 = contracts.addr1;
    addr2 = contracts.addr2;
    mockRouter = contracts.mockRouter;
    mockWETH = contracts.mockWETH;
    crossChainMessenger = contracts.crossChainMessenger;
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
            expect(timeUntil).to.be.closeTo(BigInt(PAUSE_DURATION), 5n);
        });

        it("Should allow unpause after duration", async function() {
            await emergencyPause.checkAndPause(PAUSE_THRESHOLD);
            await time.increase(PAUSE_DURATION + 1);
            expect(await emergencyPause.isPaused()).to.be.false;
        });

        it("Should not unpause before duration", async function() {
            await emergencyPause.checkAndPause(PAUSE_THRESHOLD);
            await time.increase(PAUSE_DURATION - 100);
            expect(await emergencyPause.isPaused()).to.be.true;
        });
    });

    describe("Owner Functions", function() {
        it("Should allow owner to update pause threshold", async function() {
            const newThreshold = ethers.parseEther("10.0");
            await expect(emergencyPause.setPauseThreshold(newThreshold))
                .to.emit(emergencyPause, "PauseThresholdUpdated")
                .withArgs(PAUSE_THRESHOLD, newThreshold);

            // Should not pause below new threshold
            await emergencyPause.checkAndPause(PAUSE_THRESHOLD);
            expect(await emergencyPause.isPaused()).to.be.false;

            // Should pause above new threshold
            await emergencyPause.checkAndPause(newThreshold);
            expect(await emergencyPause.isPaused()).to.be.true;
        });

        it("Should allow owner to update pause duration", async function() {
            const newDuration = 7200; // 2 hours
            await expect(emergencyPause.setPauseDuration(newDuration))
                .to.emit(emergencyPause, "PauseDurationUpdated")
                .withArgs(PAUSE_DURATION, newDuration);

            await emergencyPause.checkAndPause(PAUSE_THRESHOLD);
            await time.increase(PAUSE_DURATION);
            expect(await emergencyPause.isPaused()).to.be.true;

            await time.increase(newDuration - PAUSE_DURATION);
            expect(await emergencyPause.isPaused()).to.be.false;
        });

        it("Should prevent non-owners from updating configuration", async function() {
            await expect(
                emergencyPause.connect(user1).setPauseThreshold(ethers.parseEther("10.0"))
            ).to.be.revertedWith("Ownable: caller is not the owner");

            await expect(
                emergencyPause.connect(user1).setPauseDuration(7200)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Edge Cases", function() {
        it("Should handle zero threshold correctly", async function() {
            await emergencyPause.setPauseThreshold(0);
            await emergencyPause.checkAndPause(1);
            expect(await emergencyPause.isPaused()).to.be.true;
        });

        it("Should handle maximum threshold correctly", async function() {
            const maxThreshold = ethers.MaxUint256;
            await emergencyPause.setPauseThreshold(maxThreshold);
            await emergencyPause.checkAndPause(maxThreshold - 1n);
            expect(await emergencyPause.isPaused()).to.be.false;
        });

        it("Should handle zero duration correctly", async function() {
            await emergencyPause.setPauseDuration(0);
            await emergencyPause.checkAndPause(PAUSE_THRESHOLD);
            expect(await emergencyPause.isPaused()).to.be.false;
        });
    });
});
