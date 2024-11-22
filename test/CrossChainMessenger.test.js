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

            await expect(crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount }))
                .to.emit(crossChainMessenger, "MessageSent")
                .withArgs(
                    ethers.constants.HashZero, // messageId (mock)
                    user.address,              // sender
                    user.address,              // recipient
                    transferAmount             // amount
                );
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
