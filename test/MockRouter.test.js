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

describe("MockRouter Tests", function() {
    let owner, addr1, addr2, user;
    let mockRouter, mockWETH, crossChainMessenger;
    const DOM_CHAIN_SELECTOR = 138n;
    const POLYGON_CHAIN_SELECTOR = 137n;

    beforeEach(async function() {
        const contracts = await deployTestContracts();
        owner = contracts.owner;
        user = contracts.user;
        addr1 = contracts.addr1;
        addr2 = contracts.addr2;
        mockRouter = contracts.mockRouter;
        mockWETH = contracts.mockWETH;
        crossChainMessenger = contracts.crossChainMessenger;
    });

    describe("Chain Support and Token Management", function() {
        it("Should verify supported chains correctly", async function() {
            expect(await mockRouter.isChainSupported(POLYGON_CHAIN_SELECTOR)).to.be.true;
            expect(await mockRouter.isChainSupported(999n)).to.be.false;
        });

        it("Should handle getSupportedTokens for valid chain", async function() {
            const tokens = await mockRouter.getSupportedTokens(POLYGON_CHAIN_SELECTOR);
            expect(tokens.length).to.equal(0);
        });

        it("Should revert getSupportedTokens for invalid chain", async function() {
            await expect(mockRouter.getSupportedTokens(999n))
                .to.be.revertedWith("Chain not supported");
        });

        it("Should allow owner to set supported chain", async function() {
            const newChainId = 999n;
            await mockRouter.setSupportedChain(newChainId, true);
            expect(await mockRouter.isChainSupported(newChainId)).to.be.true;
        });

        it("Should prevent non-owner from setting supported chain", async function() {
            await expect(mockRouter.connect(addr1).setSupportedChain(999n, true))
                .to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should allow owner to set supported tokens", async function() {
            const token = addr1.address;
            await mockRouter.setSupportedTokens(token, true);
            expect(await mockRouter._testSupportedTokens(token)).to.be.true;
        });

        it("Should prevent non-owner from setting supported tokens", async function() {
            const token = addr2.address;
            await expect(mockRouter.connect(addr1).setSupportedTokens(token, true))
                .to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Fee Management", function() {
        let message;

        beforeEach(async function() {
            message = {
                receiver: ethers.AbiCoder.defaultAbiCoder().encode(["address"], [addr2.address]),
                data: ethers.AbiCoder.defaultAbiCoder().encode(
                    ["address", "uint256"],
                    [addr2.address, ethers.parseEther("1.0")]
                ),
                tokenAmounts: [],
                extraArgs: "0x",
                feeToken: ethers.ZeroAddress
            };
        });

        it("Should allow owner to set extra fee", async function() {
            const newFee = ethers.parseEther("0.5");
            await mockRouter.setExtraFee(newFee);
            const fee = await mockRouter.getFee(POLYGON_CHAIN_SELECTOR, message);
            expect(fee).to.equal(ethers.parseEther("1.1")); // BASE_FEE (0.6) + extraFee (0.5)
        });

        it("Should prevent non-owner from setting extra fee", async function() {
            await expect(mockRouter.connect(addr1).setExtraFee(ethers.parseEther("0.5")))
                .to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should revert getFee for unsupported chain", async function() {
            await expect(mockRouter.getFee(999n, message))
                .to.be.revertedWith("Chain not supported");
        });
    });

    describe("Message Handling", function() {
        it("Should validate message data correctly", async function() {
            const message = {
                messageId: ethers.hexlify(ethers.randomBytes(32)),
                sourceChainSelector: DOM_CHAIN_SELECTOR,
                sender: ethers.zeroPadValue(ethers.hexlify(addr1.address), 20),
                data: "0x1234",
                destTokenAmounts: []
            };
            expect(await mockRouter.validateMessage(message)).to.be.true;
        });

        it("Should handle ccipSend with sufficient fee", async function() {
            const message = {
                receiver: ethers.AbiCoder.defaultAbiCoder().encode(["address"], [addr2.address]),
                data: "0x",
                tokenAmounts: [],
                extraArgs: "0x",
                feeToken: ethers.ZeroAddress
            };
            await expect(mockRouter.ccipSend(POLYGON_CHAIN_SELECTOR, message, {
                value: ethers.parseEther("0.6") // BASE_FEE
            })).to.emit(mockRouter, "MessageSent");
        });

        it("Should revert ccipSend with insufficient fee", async function() {
            const message = {
                receiver: ethers.AbiCoder.defaultAbiCoder().encode(["address"], [addr2.address]),
                data: "0x",
                tokenAmounts: [],
                extraArgs: "0x",
                feeToken: ethers.ZeroAddress
            };
            await expect(mockRouter.ccipSend(POLYGON_CHAIN_SELECTOR, message, {
                value: ethers.parseEther("0.05")
            })).to.be.revertedWith("Insufficient fee");
        });
    });
});
