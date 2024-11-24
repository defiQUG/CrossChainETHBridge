const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployTestContracts, TEST_CONFIG } = require("../helpers/setup");

describe("Emergency Pause Mechanism (Isolated)", function() {
    let owner, user;
    let crossChainMessenger;
    const { BRIDGE_FEE, PAUSE_THRESHOLD } = TEST_CONFIG;

    beforeEach(async function() {
        const contracts = await deployTestContracts();
        owner = contracts.owner;
        user = contracts.user;
        crossChainMessenger = contracts.crossChainMessenger;
    });

    describe("Pause Threshold Tests", function() {
        it("Should track total value correctly with fees", async function() {
            // Calculate amount that will result in half threshold after fee subtraction
            const transferAmount = ethers.BigNumber.from(PAUSE_THRESHOLD)
                .div(2)
                .add(BRIDGE_FEE);  // Add fee so after subtraction we get exactly half threshold

            console.log("\nTest configuration:");
            console.log("Pause threshold:", ethers.utils.formatEther(PAUSE_THRESHOLD));
            console.log("Bridge fee:", ethers.utils.formatEther(BRIDGE_FEE));
            console.log("Transfer amount (with fee):", ethers.utils.formatEther(transferAmount));
            console.log("Amount after fee subtraction:", ethers.utils.formatEther(transferAmount.sub(BRIDGE_FEE)));

            // First transfer
            await crossChainMessenger.sendToPolygon(user.address, { value: transferAmount });
            console.log("\nAfter first transfer:");
            console.log("Contract paused:", await crossChainMessenger.paused());

            // Second transfer
            await crossChainMessenger.sendToPolygon(user.address, { value: transferAmount });
            console.log("\nAfter second transfer:");
            console.log("Contract paused:", await crossChainMessenger.paused());

            // Verify final state
            expect(await crossChainMessenger.paused()).to.be.true;
        });

        it("Should handle transfers just below threshold", async function() {
            const transferAmount = ethers.BigNumber.from(PAUSE_THRESHOLD)
                .div(3)  // Three transfers should be possible
                .add(BRIDGE_FEE);

            // First transfer
            await crossChainMessenger.sendToPolygon(user.address, { value: transferAmount });
            expect(await crossChainMessenger.paused()).to.be.false;

            // Second transfer
            await crossChainMessenger.sendToPolygon(user.address, { value: transferAmount });
            expect(await crossChainMessenger.paused()).to.be.false;

            // Third transfer should still work
            await crossChainMessenger.sendToPolygon(user.address, { value: transferAmount });
            expect(await crossChainMessenger.paused()).to.be.false;
        });

        it("Should pause immediately when threshold exceeded", async function() {
            const transferAmount = ethers.BigNumber.from(PAUSE_THRESHOLD)
                .add(BRIDGE_FEE);

            await expect(
                crossChainMessenger.sendToPolygon(user.address, { value: transferAmount })
            ).to.be.revertedWithCustomError(crossChainMessenger, "EmergencyPaused");
        });
    });
});
