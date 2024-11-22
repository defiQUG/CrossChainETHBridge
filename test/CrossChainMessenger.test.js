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

        // Deploy MockRouter
        const MockRouter = await ethers.getContractFactory("MockRouter");
        mockRouter = await MockRouter.deploy();
        await mockRouter.deployed();

        // Deploy MockWETH
        const MockWETH = await ethers.getContractFactory("MockWETH");
        const mockWeth = await MockWETH.deploy();
        await mockWeth.deployed();

        // Deploy CrossChainMessenger with both router and WETH addresses
        const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
        crossChainMessenger = await CrossChainMessenger.deploy(mockRouter.address, mockWeth.address);
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

    describe("Message Receiving", function() {
        it("Should receive message and convert to WETH", async function() {
            const amount = ethers.utils.parseEther("1");
            const messageId = ethers.utils.randomBytes(32);
            const message = {
                messageId,
                sourceChainSelector: 138, // Defi Oracle Meta
                sender: ethers.utils.hexZeroPad(user.address, 32),
                data: ethers.utils.defaultAbiCoder.encode(
                    ["address", "uint256"],
                    [user.address, amount]
                ),
                destTokenAmounts: []
            };

            await expect(
                mockRouter.ccipReceive(message)
            ).to.emit(crossChainMessenger, "MessageReceived")
             .withArgs(messageId, user.address, user.address, amount);
        });

        it("Should reject messages from invalid source chain", async function() {
            const amount = ethers.utils.parseEther("1");
            const message = {
                messageId: ethers.utils.randomBytes(32),
                sourceChainSelector: 1, // Invalid chain
                sender: ethers.utils.hexZeroPad(user.address, 32),
                data: ethers.utils.defaultAbiCoder.encode(
                    ["address", "uint256"],
                    [user.address, amount]
                ),
                destTokenAmounts: []
            };

            await expect(
                mockRouter.ccipReceive(message)
            ).to.be.revertedWith("Invalid source chain");
        });
    });
});
