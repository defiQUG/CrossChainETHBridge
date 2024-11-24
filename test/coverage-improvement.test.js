const { ethers } = require('hardhat');
const { expect } = require('chai');
const { deployTestContracts, TEST_CONFIG } = require('./helpers/setup');

const {
    BRIDGE_FEE,
    MAX_FEE,
    MAX_MESSAGES_PER_PERIOD,
    PAUSE_THRESHOLD,
    PAUSE_DURATION,
    POLYGON_CHAIN_SELECTOR,
    DEFI_ORACLE_META_CHAIN_SELECTOR
} = TEST_CONFIG;

const { constants } = ethers;

describe("Coverage Improvement Tests", function () {
    let messenger, router, weth, owner, user1, user2;
    const RATE_PERIOD = 3600; // 1 hour in seconds
    const MAX_MESSAGES = 5;
    let INITIAL_BALANCE;

    beforeEach(async function () {
        const contracts = await deployTestContracts();
        messenger = contracts.crossChainMessenger;
        router = contracts.mockRouter;
        weth = contracts.mockWETH;
        owner = contracts.owner;
        [, user1, user2] = await ethers.getSigners();
        INITIAL_BALANCE = ethers.utils.parseEther("10.0");

        // Fund the contract
        await owner.sendTransaction({
            to: messenger.address,
            value: INITIAL_BALANCE
        });
    });

    describe("MockWETH", function () {
        it("Should handle deposit and withdrawal correctly", async function () {
            const depositAmount = ethers.utils.parseEther("1.0");
            await weth.deposit({ value: depositAmount });
            expect(await weth.balanceOf(owner.address)).to.equal(depositAmount);
            await weth.withdraw(depositAmount);
            expect(await weth.balanceOf(owner.address)).to.equal(0);
        });

        it("Should handle transfer correctly", async function () {
            const amount = ethers.utils.parseEther("1.0");
            await weth.deposit({ value: amount });
            await weth.transfer(user1.address, amount);
            expect(await weth.balanceOf(user1.address)).to.equal(amount);
        });
    });

    describe("RateLimiter Edge Cases", function () {
        it("Should handle multiple messages within same period", async function () {
            const messageValue = ethers.utils.parseEther("1.0");
            for (let i = 0; i < MAX_MESSAGES; i++) {
                await messenger.sendToPolygon(user1.address, { value: messageValue });
            }
            await expect(
                messenger.sendToPolygon(user1.address, { value: messageValue })
            ).to.be.revertedWith("SecurityBase: Rate limit exceeded");
        });
    });

    describe("Emergency Controls", function () {
        it("Should handle emergency withdraw correctly", async function () {
            await messenger.emergencyPause();
            const initialBalance = await ethers.provider.getBalance(user2.address);
            await messenger.emergencyWithdraw(user2.address);
            const finalBalance = await ethers.provider.getBalance(user2.address);
            expect(finalBalance.sub(initialBalance)).to.equal(INITIAL_BALANCE);
        });

        it("Should prevent emergency withdraw when not paused", async function () {
            if (await messenger.paused()) {
                await messenger.emergencyUnpause();
            }
            await expect(
                messenger.emergencyWithdraw(user2.address)
            ).to.be.revertedWith("EmergencyPause: contract not paused");
        });

        it("Should prevent emergency withdraw to zero address", async function () {
            await messenger.emergencyPause();
            await expect(
                messenger.emergencyWithdraw(constants.AddressZero)
            ).to.be.revertedWith("InvalidRecipient");
        });
    });

    describe("MockRouter", function () {
        it("Should handle ccipSend correctly", async function () {
            const amount = ethers.utils.parseEther("1.0");
            const tx = await messenger.sendToPolygon(user1.address, { value: amount });
            await tx.wait();
            const events = await router.queryFilter(router.filters.MessageSent());
            expect(events.length).to.equal(1);
        });

        it("Should emit correct events on message send", async function () {
            const amount = ethers.utils.parseEther("1.0");
            await expect(
                messenger.sendToPolygon(user1.address, { value: amount })
            ).to.emit(router, "MessageSent").withArgs(
                messenger.address,
                amount,
                user1.address
            );
        });
    });
});
