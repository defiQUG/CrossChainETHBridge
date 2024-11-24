const { ethers } = require('hardhat');
const { expect } = require('chai');
const { deployTestContracts } = require('./helpers/setup');

describe("MockRouter Tests", function() {
    let owner, addr1, addr2, user;
    let mockRouter, mockWETH, crossChainMessenger;
    const DOM_CHAIN_SELECTOR = 138n;
    const POLYGON_CHAIN_SELECTOR = 137n;
    const BASE_FEE = ethers.utils.parseUnits("0.6", "ether");

    beforeEach(async function() {
        [owner, addr1, addr2, user] = await ethers.getSigners();
        const contracts = await deployTestContracts();
        mockRouter = contracts.mockRouter;
        mockWETH = contracts.mockWETH;
        crossChainMessenger = contracts.crossChainMessenger;
    });

    describe("Chain Support and Token Management", function() {
        it("Should verify supported chains correctly", async function() {
            expect(await mockRouter._supportedChains(DOM_CHAIN_SELECTOR)).to.be.true;
            expect(await mockRouter._supportedChains(POLYGON_CHAIN_SELECTOR)).to.be.true;
            expect(await mockRouter._supportedChains(999n)).to.be.false;
        });

        it("Should handle getSupportedTokens for valid chain", async function() {
            const tokens = await mockRouter.getSupportedTokens(DOM_CHAIN_SELECTOR);
            expect(tokens).to.be.an('array').that.is.empty;
        });

        it("Should revert getSupportedTokens for invalid chain", async function() {
            await expect(mockRouter.getSupportedTokens(999n))
                .to.be.revertedWith("MockRouter: chain not supported");
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
                    [addr2.address, ethers.utils.parseUnits("1.0", "ether")]
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
            const fee = await mockRouter.getFee(POLYGON_CHAIN_SELECTOR, message);
            // Extra fee is set to baseFee/2 in initialize()
            expect(fee).to.equal(BASE_FEE.add(BASE_FEE.div(2)));
        });

        it("Should revert getFee for unsupported chain", async function() {
            await expect(mockRouter.getFee(999n, message))
                .to.be.revertedWith("MockRouter: chain not supported");
        });
    });

    describe("Message Handling", function() {
        it("Should validate message data correctly", async function() {
            const message = {
                messageId: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
                sourceChainSelector: DOM_CHAIN_SELECTOR,
                sender: ethers.utils.hexZeroPad(addr1.address, 32),
                data: "0x1234",
                destTokenAmounts: []
            };
            expect(await mockRouter.validateMessage(message)).to.be.true;
        });

        it("Should handle ccipSend correctly", async function() {
            const message = {
                receiver: ethers.utils.defaultAbiCoder.encode(["address"], [addr2.address]),
                data: "0x1234",
                tokenAmounts: [],
                extraArgs: "0x",
                feeToken: ethers.constants.AddressZero
            };

            await expect(mockRouter.ccipSend(POLYGON_CHAIN_SELECTOR, message))
                .to.emit(mockRouter, "MessageSent")
                .withArgs(
                    ethers.utils.solidityKeccak256(
                        ["uint256", "tuple(bytes,bytes,tuple(address,uint256)[],bytes,address)", "address"],
                        [
                            await ethers.provider.getBlock("latest").then(b => b.timestamp),
                            [message.receiver, message.data, message.tokenAmounts, message.extraArgs, message.feeToken],
                            owner.address
                        ]
                    ),
                    POLYGON_CHAIN_SELECTOR,
                    message
                );
        });

        it("Should revert ccipSend for unsupported chain", async function() {
            const message = {
                receiver: ethers.utils.defaultAbiCoder.encode(["address"], [addr2.address]),
                data: "0x",
                tokenAmounts: [],
                extraArgs: "0x",
                feeToken: ethers.constants.AddressZero
            };
            await expect(mockRouter.ccipSend(999n, message))
                .to.be.revertedWith("MockRouter: chain not supported");
        });
    });
});
