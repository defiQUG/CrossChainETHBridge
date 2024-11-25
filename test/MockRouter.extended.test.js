const { ethers } = require('hardhat');
const { expect } = require('chai');
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

describe("MockRouter Extended Tests", function () {
    let router, owner, user1, user2;
    const POLYGON_CHAIN_ID = 137;
    const MAX_MESSAGES = 10;
    const RATE_PERIOD = 3600; // 1 hour in seconds
    let defaultMessage;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        const MockRouter = await ethers.getContractFactory("MockRouter");
        router = await MockRouter.deploy(MAX_MESSAGES, RATE_PERIOD);
        await router.waitForDeployment();

        defaultMessage = {
            receiver: ethers.AbiCoder.defaultAbiCoder().encode(["address"], [user2.address]),
            data: ethers.AbiCoder.defaultAbiCoder().encode(
                ["address", "uint256"],
                [user1.address, ethers.parseEther("1.0")]
            ),
            tokenAmounts: [],
            extraArgs: "0x",
            feeToken: ethers.ZeroAddress
        };
    });

    describe("Message Handling", function () {
        it("Should handle ccipSend with correct parameters", async function () {
            const tx = await router.ccipSend(POLYGON_CHAIN_ID, defaultMessage);
            const receipt = await tx.wait();
            const event = receipt.logs?.find(log => {
                try {
                    return router.interface.parseLog(log)?.name === "MessageSent";
                } catch (e) {
                    return false;
                }
            });
            expect(event).to.not.be.undefined;
        });

        it("Should handle multiple messages correctly", async function () {
            for (let i = 0; i < 3; i++) {
                await router.ccipSend(POLYGON_CHAIN_ID, defaultMessage);
            }
            const filter = router.filters.MessageSent();
            const events = await router.queryFilter(filter);
            expect(events.length).to.equal(3);
        });

        it("Should handle messages with different chain IDs", async function () {
            await expect(router.ccipSend(POLYGON_CHAIN_ID, defaultMessage))
                .to.emit(router, "MessageSent");
        });

        it("Should handle empty messages", async function () {
            const emptyMessage = {
                ...defaultMessage,
                data: "0x",
                tokenAmounts: []
            };
            await expect(router.ccipSend(POLYGON_CHAIN_ID, emptyMessage))
                .to.emit(router, "MessageSent");
        });
    });

    describe("Error Handling", function () {
        it("Should handle zero chain ID", async function () {
            await expect(router.ccipSend(0, defaultMessage))
                .to.be.revertedWith("Invalid chain selector");
        });

        it("Should handle invalid chain ID", async function () {
            await expect(router.ccipSend(999999, defaultMessage))
                .to.be.revertedWith("Chain not supported");
        });
    });
});
