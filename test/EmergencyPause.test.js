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

describe("EmergencyPause", function() {
    let owner, user1, user, addr1, addr2;
    let emergencyPause;

    beforeEach(async function() {
        [owner, user1, addr1, addr2] = await ethers.getSigners();
        const EmergencyPause = await ethers.getContractFactory("EmergencyPause");
        emergencyPause = await EmergencyPause.deploy(PAUSE_THRESHOLD, PAUSE_DURATION);
        await emergencyPause.waitForDeployment();
    });

    describe("Value Management", function() {
        it("Should track locked value correctly", async function() {
            const amount = ethers.utils.parseEther("1.0");
            await emergencyPause.lockValue(amount);
            expect(await emergencyPause.totalValueLocked()).to.equal(amount);
        });

        it("Should trigger pause when threshold exceeded", async function() {
            const tx = await emergencyPause.lockValue(PAUSE_THRESHOLD);
            const receipt = await tx.wait();
            const block = await ethers.provider.getBlock(receipt.blockNumber);
            await expect(tx)
                .to.emit(emergencyPause, "EmergencyPauseTriggered")
                .withArgs(block.timestamp, PAUSE_DURATION);
            expect(await emergencyPause.paused()).to.be.true;
        });

        it("Should allow value unlocking", async function() {
            const amount = ethers.utils.parseEther("2.0");
            await emergencyPause.lockValue(amount);
            await expect(emergencyPause.unlockValue(amount))
                .to.emit(emergencyPause, "ValueUnlocked")
                .withArgs(amount);
            expect(await emergencyPause.totalValueLocked()).to.equal(0);
        });

        it("Should prevent unlocking more than locked", async function() {
            const lockAmount = ethers.utils.parseEther("1.0");
            const unlockAmount = ethers.utils.parseEther("2.0");
            await emergencyPause.lockValue(lockAmount);
            await expect(emergencyPause.unlockValue(unlockAmount))
                .to.be.revertedWithCustomError(emergencyPause, "InsufficientLockedValue");
        });
    });

    describe("Pause Management", function() {
        it("Should auto-unpause after duration", async function() {
            await emergencyPause.lockValue(PAUSE_THRESHOLD);
            await time.increase(PAUSE_DURATION + 1);
            await emergencyPause.checkAndUnpause();
            expect(await emergencyPause.paused()).to.be.false;
        });

        it("Should allow owner to force unpause", async function() {
            await emergencyPause.lockValue(PAUSE_THRESHOLD);
            await ethers.provider.send("evm_mine");
            const tx = await emergencyPause.emergencyUnpause();
            const receipt = await tx.wait();
            const block = await ethers.provider.getBlock(receipt.blockNumber);
            await expect(tx)
                .to.emit(emergencyPause, "EmergencyUnpauseTriggered")
                .withArgs(block.timestamp);
            expect(await emergencyPause.paused()).to.be.false;
        });

        it("Should prevent operations while paused", async function() {
            await emergencyPause.lockValue(PAUSE_THRESHOLD);
            await expect(emergencyPause.lockValue(ethers.utils.parseEther("1.0")))
                .to.be.revertedWithCustomError(emergencyPause, "AlreadyPaused");
            await expect(emergencyPause.unlockValue(ethers.utils.parseEther("1.0")))
                .to.be.revertedWithCustomError(emergencyPause, "AlreadyPaused");
        });
    });

    describe("Configuration", function() {
        it("Should allow owner to update pause threshold", async function() {
            const newThreshold = ethers.utils.parseEther("10.0");
            await expect(emergencyPause.setPauseThreshold(newThreshold))
                .to.emit(emergencyPause, "PauseThresholdUpdated")
                .withArgs(newThreshold);
            expect(await emergencyPause.getPauseThreshold()).to.equal(newThreshold);
        });

        it("Should allow owner to update pause duration", async function() {
            const newDuration = 7200;
            await expect(emergencyPause.setPauseDuration(newDuration))
                .to.emit(emergencyPause, "PauseDurationUpdated")
                .withArgs(newDuration);
            expect(await emergencyPause.getPauseDuration()).to.equal(newDuration);
        });

        it("Should prevent non-owners from updating configuration", async function() {
            await expect(emergencyPause.connect(user1).setPauseThreshold(ethers.utils.parseEther("10.0")))
                .to.be.revertedWith("Ownable: caller is not the owner");
            await expect(emergencyPause.connect(user1).setPauseDuration(7200))
                .to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should validate configuration parameters", async function() {
            await expect(emergencyPause.setPauseThreshold(0))
                .to.be.revertedWithCustomError(emergencyPause, "InvalidPauseThreshold");
            await expect(emergencyPause.setPauseDuration(0))
                .to.be.revertedWithCustomError(emergencyPause, "InvalidPauseDuration");
        });
    });

    describe("View Functions", function() {
        it("Should return correct remaining pause duration", async function() {
            await emergencyPause.lockValue(PAUSE_THRESHOLD);
            const remaining = await emergencyPause.getRemainingPauseDuration();
            expect(remaining).to.be.lessThanOrEqual(BigInt(PAUSE_DURATION));
            expect(remaining).to.be.greaterThan(0n);
        });

        it("Should return zero remaining duration when not paused", async function() {
            expect(await emergencyPause.getRemainingPauseDuration()).to.equal(0);
        });
    });
});
