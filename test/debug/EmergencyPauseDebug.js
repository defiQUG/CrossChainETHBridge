const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EmergencyPause Debug", function() {
    let emergencyPause;
    let owner;
    const PAUSE_THRESHOLD = ethers.utils.parseEther("100.0");
    const PAUSE_DURATION = 7200;

    beforeEach(async function() {
        [owner] = await ethers.getSigners();
        const EmergencyPause = await ethers.getContractFactory("EmergencyPause");
        emergencyPause = await EmergencyPause.deploy(PAUSE_THRESHOLD, PAUSE_DURATION);
        await emergencyPause.deployed();
    });

    it("Debug value tracking", async function() {
        const amount = ethers.BigNumber.from(PAUSE_THRESHOLD)
            .div(2)
            .sub(ethers.utils.parseEther("0.1"));

        console.log("Initial state:");
        console.log("Pause threshold:", ethers.utils.formatEther(PAUSE_THRESHOLD));
        console.log("Test amount:", ethers.utils.formatEther(amount));
        console.log("Total value locked:", ethers.utils.formatEther(await emergencyPause.totalValueLocked()));

        // First transfer
        await emergencyPause.checkAndUpdateValue(amount);
        console.log("\nAfter first transfer:");
        console.log("Total value locked:", ethers.utils.formatEther(await emergencyPause.totalValueLocked()));
        console.log("Is paused:", await emergencyPause.paused());

        // Second transfer
        await emergencyPause.checkAndUpdateValue(amount);
        console.log("\nAfter second transfer:");
        console.log("Total value locked:", ethers.utils.formatEther(await emergencyPause.totalValueLocked()));
        console.log("Is paused:", await emergencyPause.paused());
    });
});
