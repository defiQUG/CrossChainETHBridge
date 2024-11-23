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

describe("MockRouter Coverage Tests", function () {
    let mockRouter, owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        const MockRouter = await ethers.getContractFactory("MockRouter");
        mockRouter = await MockRouter.deploy();
        await mockRouter.waitForDeployment();
    });

    describe("Chain Support and Token Management", function () {
        it("Should verify supported chains correctly", async function () {
            expect(await mockRouter.isChainSupported(137)).to.be.true; // Polygon PoS
            expect(await mockRouter.isChainSupported(138)).to.be.false; // Defi Oracle Meta
        });

        it("Should handle getSupportedTokens for valid chain", async function () {
            const tokens = await mockRouter.getSupportedTokens(137); // Polygon PoS
            expect(tokens).to.be.an('array').that.is.empty;
        });

        it("Should revert getSupportedTokens for invalid chain", async function () {
            await expect(mockRouter.getSupportedTokens(138)) // Defi Oracle Meta
                .to.be.revertedWith("Unsupported chain");
        });
    });

    describe("Message Simulation", function () {
        let message;

        beforeEach(async function () {
            message = {
                messageId: ethers.randomBytes(32),
                sourceChainSelector: DEFI_ORACLE_META_CHAIN_SELECTOR,
                sender: ethers.hexlify(ethers.randomBytes(20)),
                data: ethers.AbiCoder.defaultAbiCoder().encode(
                    ['address', 'uint256'],
                    [addr1.address, ethers.parseEther("1.0")]
                ),
                destTokenAmounts: [],
                extraArgs: "0x"
            };
        });

        it("Should handle message simulation correctly", async function () {
            const MockReceiver = await ethers.getContractFactory("MockRouter");
            const receiver = await MockReceiver.deploy();
            await receiver.waitForDeployment();
            await mockRouter.simulateMessageReceived(receiver.address, message);
        });

        it("Should revert simulation with invalid source chain", async function () {
            const invalidMessage = { ...message, sourceChainSelector: POLYGON_CHAIN_SELECTOR };
            await expect(mockRouter.simulateMessageReceived(addr1.address, invalidMessage))
                .to.be.revertedWith("Invalid source chain");
        });

        it("Should revert simulation with zero address target", async function () {
            await expect(mockRouter.simulateMessageReceived(ethers.ZeroAddress, message))
                .to.be.revertedWith("Invalid target address");
        });
    });

    describe("Message Reception", function () {
        let ccipMessage;

        beforeEach(async function () {
            ccipMessage = {
                messageId: ethers.randomBytes(32),
                sourceChainSelector: DEFI_ORACLE_META_CHAIN_SELECTOR,
                sender: ethers.hexlify(ethers.randomBytes(20)),
                receiver: addr1.address,
                data: ethers.AbiCoder.defaultAbiCoder().encode(
                    ['address', 'uint256'],
                    [addr1.address, ethers.parseEther("1.0")]
                ),
                tokenAmounts: [],
                extraArgs: "0x",
                feeToken: ethers.ZeroAddress,
                feeAmount: ethers.parseEther("0.1")
            };
        });

        it("Should handle ccipReceive correctly", async function () {
            await mockRouter.ccipReceive(ccipMessage);
        });

        it("Should handle fee calculations correctly", async function () {
            const messageFee = await mockRouter.getFee(POLYGON_CHAIN_SELECTOR, ccipMessage);
            expect(messageFee).to.equal(ethers.parseEther("0.1"));

            await expect(mockRouter.getFee(DEFI_ORACLE_META_CHAIN_SELECTOR, ccipMessage))
                .to.be.revertedWith("Unsupported chain");
        });

        it("Should validate message data correctly", async function () {
            const invalidMessage = { ...ccipMessage, receiver: ethers.ZeroAddress };
            await expect(mockRouter.validateMessage(invalidMessage))
                .to.be.revertedWith("Invalid recipient");
        });

        it("Should handle message validation errors", async function () {
            const invalidMessage = { ...ccipMessage, sourceChainSelector: 0 };
            await expect(mockRouter.validateMessage(invalidMessage))
                .to.be.revertedWith("Invalid chain selector");
        });
    });
});
