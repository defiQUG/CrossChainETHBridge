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
            // Access internal mapping through storage
            const domChainSlot = await ethers.provider.getStorageAt(
                mockRouter.address,
                ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['uint64', 'uint256'], [DOM_CHAIN_SELECTOR, 13]))
            );
            const polyChainSlot = await ethers.provider.getStorageAt(
                mockRouter.address,
                ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['uint64', 'uint256'], [POLYGON_CHAIN_SELECTOR, 13]))
            );

            expect(domChainSlot).to.not.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
            expect(polyChainSlot).to.not.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
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
                receiver: ethers.utils.defaultAbiCoder.encode(["address"], [addr2.address]),
                data: ethers.utils.defaultAbiCoder.encode(
                    ["address", "uint256"],
                    [addr2.address, ethers.utils.parseUnits("1.0", "ether")]
                ),
                tokenAmounts: [],
                extraArgs: "0x",
                feeToken: ethers.constants.AddressZero
            };
        });

        it("Should calculate fee correctly for message without data", async function() {
            const messageWithoutData = {
                ...message,
                data: "0x"
            };
            const fee = await mockRouter.getFee(POLYGON_CHAIN_SELECTOR, messageWithoutData);
            const expectedFee = ethers.utils.parseUnits("1", "ether");  // Contract's _baseFee value
            expect(fee).to.equal(expectedFee);
        });

        it("Should calculate fee correctly for message with data", async function() {
            const fee = await mockRouter.getFee(POLYGON_CHAIN_SELECTOR, message);
            const expectedFee = ethers.utils.parseUnits("1.5", "ether");  // baseFee + extraFee (baseFee/2)
            expect(fee).to.equal(expectedFee);
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

            const tx = await mockRouter.ccipSend(POLYGON_CHAIN_SELECTOR, message);
            const receipt = await tx.wait();
            const event = receipt.events?.find(e => e.event === "MessageSent");
            expect(event).to.not.be.undefined;

            const block = await ethers.provider.getBlock(receipt.blockNumber);
            const expectedMessageId = ethers.utils.keccak256(
                ethers.utils.defaultAbiCoder.encode(
                    ["uint256", "tuple(bytes,bytes,tuple(address,uint256)[],bytes,address)", "address"],
                    [block.timestamp, [message.receiver, message.data, message.tokenAmounts, message.extraArgs, message.feeToken], owner.address]
                )
            );
            expect(event.args.messageId).to.equal(expectedMessageId);
            expect(event.args.destinationChainSelector).to.equal(POLYGON_CHAIN_SELECTOR);
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
