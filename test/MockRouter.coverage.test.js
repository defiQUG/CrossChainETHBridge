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

describe("Router Coverage Tests", function () {
    let router, owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        const TestRouter = await ethers.getContractFactory("TestRouter");
        router = await TestRouter.deploy();
        await router.waitForDeployment();
    });

    describe("Chain Support and Token Management", function () {
        it("Should verify supported chains correctly", async function () {
            expect(await router.isChainSupported(POLYGON_CHAIN_SELECTOR)).to.be.true;
            expect(await router.isChainSupported(999)).to.be.false;
        });

        it("Should handle getSupportedTokens for valid chain", async function () {
            const tokens = await router.getSupportedTokens(137); // Polygon PoS
            expect(tokens).to.be.an('array').that.is.empty;
        });

        it("Should revert getSupportedTokens for invalid chain", async function () {
            await expect(router.getSupportedTokens(138)) // Defi Oracle Meta
                .to.be.revertedWith("Chain not supported");
        });
    });

    describe("Message Simulation", function () {
        let message;

        beforeEach(async function () {
            message = {
                messageId: ethers.randomBytes(32),
                sourceChainSelector: POLYGON_CHAIN_SELECTOR,
                sender: ethers.hexlify(ethers.randomBytes(20)),
                receiver: addr1.address,
                data: ethers.AbiCoder.defaultAbiCoder().encode(
                    ['address', 'uint256'],
                    [addr1.address, ethers.parseEther("1.0")]
                ),
                tokenAmounts: [],
                destTokenAmounts: [],
                extraArgs: "0x"
            };
        });

        it("Should handle message simulation correctly", async function () {
            // Deploy a mock contract that can receive messages
            const MockWETH = await ethers.getContractFactory("MockWETH");
            const receiver = await MockWETH.deploy("Wrapped Ether", "WETH");
            await receiver.waitForDeployment();

            // Update message data to be a valid WETH deposit
            message.data = ethers.AbiCoder.defaultAbiCoder().encode(
                ['address'],
                [addr1.address]
            );

            await router.simulateMessageReceived(await receiver.getAddress(), message);
        });

        it("Should revert simulation with invalid source chain", async function () {
            const invalidMessage = { ...message, sourceChainSelector: DEFI_ORACLE_META_CHAIN_SELECTOR };
            await expect(router.simulateMessageReceived(addr1.address, invalidMessage))
                .to.be.revertedWith("Chain not supported");
        });

        it("Should revert simulation with zero address target", async function () {
            await expect(router.simulateMessageReceived(ethers.ZeroAddress, message))
                .to.be.revertedWith("Invalid target address");
        });
    });

    describe("Message Reception", function () {
        let ccipMessage;

        beforeEach(async function () {
            ccipMessage = {
                messageId: ethers.randomBytes(32),
                sourceChainSelector: POLYGON_CHAIN_SELECTOR,
                sender: ethers.hexlify(ethers.randomBytes(20)),
                receiver: addr1.address,
                data: ethers.AbiCoder.defaultAbiCoder().encode(
                    ['address', 'uint256'],
                    [addr1.address, ethers.parseEther("1.0")]
                ),
                tokenAmounts: [],
                destTokenAmounts: [],
                extraArgs: "0x",
                feeToken: ethers.ZeroAddress,
                feeAmount: BRIDGE_FEE
            };
        });

        it("Should handle ccipReceive correctly", async function () {
            await router.ccipReceive(ccipMessage);
        });

        it("Should handle fee calculations correctly", async function () {
            const messageFee = await router.getFee(POLYGON_CHAIN_SELECTOR, ccipMessage);
            expect(messageFee).to.equal(ethers.parseEther("0.1"));

            await expect(router.getFee(DEFI_ORACLE_META_CHAIN_SELECTOR, ccipMessage))
                .to.be.revertedWith("Chain not supported");
        });

        it("Should validate message data correctly", async function () {
            const invalidMessage = { ...ccipMessage, sender: ethers.hexlify(ethers.randomBytes(10)) }; // Invalid 10-byte sender
            await expect(router.validateMessage(invalidMessage))
                .to.be.revertedWith("Invalid sender length");
        });

        it("Should handle message validation errors", async function () {
            const invalidMessage = { ...ccipMessage, sourceChainSelector: 0 };
            await expect(router.validateMessage(invalidMessage))
                .to.be.revertedWith("Chain not supported");
        });
    });
});
