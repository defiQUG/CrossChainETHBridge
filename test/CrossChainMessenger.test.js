const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrossChainMessenger", function() {
    let crossChainMessenger;
    let mockRouter;
    let owner;
    let user;
    const POLYGON_CHAIN_SELECTOR = 137;

    beforeEach(async function() {
        [owner, user] = await ethers.getSigners();

        const MockRouter = await ethers.getContractFactory("MockRouter");
        mockRouter = await MockRouter.deploy();
        await mockRouter.deployed();

        const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
        crossChainMessenger = await CrossChainMessenger.deploy(mockRouter.address);
        await crossChainMessenger.deployed();

        // Fund the contract for message receiving tests
        await owner.sendTransaction({
            to: crossChainMessenger.address,
            value: ethers.utils.parseEther("10.0")
        });
    });

    describe("Basic Functionality", function() {
        it("Should initialize with correct router address", async function() {
            expect(await crossChainMessenger.router()).to.equal(mockRouter.address);
        });

        it("Should set correct bridge fee", async function() {
            expect(await crossChainMessenger.bridgeFee()).to.equal(ethers.utils.parseEther("0.1"));
        });
    });

    describe("Message Sending", function() {
        it("Should send message to Polygon", async function() {
            const amount = ethers.utils.parseEther("1");
            const transferAmount = amount.sub(ethers.utils.parseEther("0.1")); // Subtract bridge fee

            // Fund the contract for message receiving
            await owner.sendTransaction({
                to: crossChainMessenger.address,
                value: ethers.utils.parseEther("10.0")
            });

            const tx = await crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount });
            const receipt = await tx.wait();

            // Verify the MessageSent event was emitted with any valid message ID (not checking exact value)
            const event = receipt.events.find(e => e.event === 'MessageSent');
            expect(event).to.not.be.undefined;
            expect(event.args.sender).to.equal(user.address);
            expect(event.args.recipient).to.equal(user.address);
            expect(event.args.amount).to.equal(transferAmount);
        });
    });

    describe("Security Features", function() {
        it("Should pause and unpause", async function() {
            await crossChainMessenger.pause();
            expect(await crossChainMessenger.paused()).to.be.true;
            await crossChainMessenger.unpause();
            expect(await crossChainMessenger.paused()).to.be.false;
        });

        it("Should prevent sending when paused", async function() {
            await crossChainMessenger.pause();
            const amount = ethers.utils.parseEther("1");
            await expect(
                crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount })
            ).to.be.revertedWith("Pausable: paused");
        });
    });
});
