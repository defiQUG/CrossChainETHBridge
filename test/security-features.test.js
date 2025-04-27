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

describe("Security Features", function() {
    let crossChainMessenger;
    let owner;
    let user;
    let router;
    let weth;
    let addr1;
    let addr2;

    beforeEach(async function() {
        const contracts = await deployTestContracts();
        owner = contracts.owner;
        user = contracts.user;
        addr1 = contracts.addr1;
        addr2 = contracts.addr2;
        router = contracts.mockRouter;
        weth = contracts.mockWETH;
        crossChainMessenger = contracts.crossChainMessenger;
    });

    describe("Rate Limiting", function() {
        it("Should enforce rate limits", async function() {
            const amount = ethers.utils.parseEther("11.0");
            await expect(
                crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount })
            ).to.be.revertedWith("Rate limit exceeded");
        });

        it("Should reset rate limit after period", async function() {
            const amount = ethers.utils.parseEther("5.0");
            await crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount });
            await time.increase(3601); // Advance time by more than 1 hour
            await expect(
                crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount })
            ).to.not.be.reverted;
        });
    });

    describe("Emergency Pause", function() {
        it("Should pause on large transfers", async function() {
            const amount = ethers.utils.parseEther("101.0");
            await expect(
                crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount })
            ).to.be.revertedWith("Contract paused");
        });

        it("Should auto-unpause after duration", async function() {
            const largeAmount = ethers.utils.parseEther("101.0");
            await expect(
                crossChainMessenger.connect(user).sendToPolygon(user.address, { value: largeAmount })
            ).to.be.revertedWith("Contract paused");

            await time.increase(86401); // Advance time by more than 24 hours
            const smallAmount = ethers.utils.parseEther("1.0");
            await expect(
                crossChainMessenger.connect(user).sendToPolygon(user.address, { value: smallAmount })
            ).to.not.be.reverted;
        });
    });
});
