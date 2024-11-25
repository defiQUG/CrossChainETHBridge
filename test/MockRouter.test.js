const { ethers } = require('hardhat');
const { expect } = require('chai');
const { deployTestContracts } = require('./helpers/TestSetup');

describe("MockRouter Tests", function() {
    let owner, addr1, addr2, user;
    let mockRouter, mockWETH, crossChainMessenger;
    const DOM_CHAIN_SELECTOR = 138n;
    const POLYGON_CHAIN_SELECTOR = 137n;
    const BASE_FEE = ethers.parseUnits("1.1", "ether");

    beforeEach(async function() {
        [owner, addr1, addr2, user] = await ethers.getSigners();
        const contracts = await deployTestContracts();
        mockRouter = contracts.mockRouter;
        mockWETH = contracts.mockWETH;
        crossChainMessenger = contracts.messenger;

        // Initialize MockRouter with required parameters
        await mockRouter.initialize(
            owner.address,  // admin
            ethers.ZeroAddress,  // feeToken
            BASE_FEE  // baseFee
        );
        await mockRouter.setSupportedChain(POLYGON_CHAIN_SELECTOR, true);
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
                    [addr2.address, ethers.parseUnits("1.0", "ether")]
                ),
                tokenAmounts: [],
                extraArgs: "0x",
                feeToken: ethers.ZeroAddress
            };
        });

        it("Should calculate fee correctly with no extra fee", async function() {
            const fee = await mockRouter.getFee(POLYGON_CHAIN_SELECTOR, message);
            expect(fee).to.equal(BASE_FEE);
        });

        it("Should calculate fee correctly with extra fee", async function() {
            const extraFee = ethers.parseUnits("0.5", "ether");
            await mockRouter.setExtraFee(extraFee);
            const fee = await mockRouter.getFee(POLYGON_CHAIN_SELECTOR, message);
            expect(fee).to.equal(BASE_FEE + extraFee);
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
                sender: ethers.zeroPadValue(ethers.hexlify(addr1.address), 32),
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
            const fee = await mockRouter.getFee(POLYGON_CHAIN_SELECTOR, message);
            await expect(mockRouter.ccipSend(POLYGON_CHAIN_SELECTOR, message, {
                value: fee
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
            const fee = await mockRouter.getFee(POLYGON_CHAIN_SELECTOR, message);
            await expect(mockRouter.ccipSend(POLYGON_CHAIN_SELECTOR, message, {
                value: ethers.parseUnits("0.05", "ether")
            })).to.be.revertedWith("Insufficient fee");
        });
    });
});
