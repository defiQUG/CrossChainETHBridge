const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrossChainMessenger", function() {
    let owner;
    let user;
    let mockRouter;
    let mockWETH;
    let crossChainMessenger;
    const POLYGON_CHAIN_SELECTOR = 137;
    const MAX_MESSAGES_PER_PERIOD = 5;

    beforeEach(async function() {
        [owner, user] = await ethers.getSigners();

        // Deploy MockWETH
        const MockWETH = await ethers.getContractFactory("MockWETH");
        mockWETH = await MockWETH.deploy("Wrapped Ether", "WETH");
        await mockWETH.deployed();

        // Deploy MockRouter
        const MockRouter = await ethers.getContractFactory("MockRouter");
        mockRouter = await MockRouter.deploy();
        await mockRouter.deployed();

        // Deploy CrossChainMessenger with router, WETH, and rate limit
        const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
        crossChainMessenger = await CrossChainMessenger.deploy(
            mockRouter.address,
            mockWETH.address,
            MAX_MESSAGES_PER_PERIOD
        );
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

            await owner.sendTransaction({
                to: crossChainMessenger.address,
                value: ethers.utils.parseEther("10.0")
            });

            const tx = await crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount });
            const receipt = await tx.wait();

            const event = receipt.events.find(e => e.event === 'MessageSent');
            expect(event).to.not.be.undefined;
            expect(event.args.sender).to.equal(user.address);
            expect(event.args.recipient).to.equal(user.address);
            expect(event.args.amount).to.equal(transferAmount);
        });

        it("Should enforce rate limiting", async function() {
            const amount = ethers.utils.parseEther("1");

            // Send messages up to the limit
            for (let i = 0; i < MAX_MESSAGES_PER_PERIOD; i++) {
                await crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount });
            }

            // Next message should fail
            await expect(
                crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount })
            ).to.be.revertedWith("Rate limit exceeded");
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
            const sender = ethers.utils.hexZeroPad(user.address, 32);
            const data = ethers.utils.defaultAbiCoder.encode(
                ["address", "uint256"],
                [user.address, amount]
            );

            // Create CCIP message format
            const message = {
                messageId: messageId,
                sourceChainSelector: 138, // Defi Oracle Meta
                sender: sender,
                data: data,
                destTokenAmounts: []
            };

            await mockRouter.simulateMessageReceived(
                crossChainMessenger.address,
                message
            );

            // Verify WETH transfer event
            const transferFilter = mockWETH.filters.Transfer(crossChainMessenger.address, user.address);
            const events = await mockWETH.queryFilter(transferFilter);
            expect(events.length).to.equal(1);
            expect(events[0].args.value).to.equal(amount);
        });

        it("Should reject messages from invalid source chain", async function() {
            const amount = ethers.utils.parseEther("1");
            const messageId = ethers.utils.randomBytes(32);
            const sender = ethers.utils.hexZeroPad(user.address, 32);
            const data = ethers.utils.defaultAbiCoder.encode(
                ["address", "uint256"],
                [user.address, amount]
            );

            // Create CCIP message with invalid chain selector
            const message = {
                messageId: messageId,
                sourceChainSelector: 1, // Invalid chain selector
                sender: sender,
                data: data,
                destTokenAmounts: []
            };

            await expect(
                mockRouter.simulateMessageReceived(
                    crossChainMessenger.address,
                    message
                )
            ).to.be.revertedWith("Invalid source chain");
        });

        it("Should enforce rate limiting on message receiving (edge case)", async function() {
            const amount = ethers.utils.parseEther("1");
            const sender = ethers.utils.hexZeroPad(user.address, 32);
            const data = ethers.utils.defaultAbiCoder.encode(
                ["address", "uint256"],
                [user.address, amount]
            );

            // Fund the contract with ETH
            await owner.sendTransaction({
                to: crossChainMessenger.address,
                value: ethers.utils.parseEther("10")
            });

            // Fund contract with WETH
            await mockWETH.deposit({ value: ethers.utils.parseEther("10") });
            await mockWETH.transfer(crossChainMessenger.address, ethers.utils.parseEther("10"));

            // Send messages up to the limit
            for (let i = 0; i < MAX_MESSAGES_PER_PERIOD; i++) {
                const message = {
                    messageId: ethers.utils.randomBytes(32),
                    sourceChainSelector: 138,
                    sender: sender,
                    data: data,
                    destTokenAmounts: []
                };

                await mockRouter.simulateMessageReceived(
                    crossChainMessenger.address,
                    message
                );
            }

            // Next message should fail (edge case)
            const message = {
                messageId: ethers.utils.randomBytes(32),
                sourceChainSelector: 138,
                sender: sender,
                data: data,
                destTokenAmounts: []
            };

            await expect(
                mockRouter.simulateMessageReceived(
                    crossChainMessenger.address,
                    message
                )
            ).to.be.revertedWith("Rate limit exceeded for current period");
        });

        it("Should handle zero amount transfers (edge case)", async function() {
            const amount = ethers.utils.parseEther("0");
            const messageId = ethers.utils.randomBytes(32);
            const sender = ethers.utils.hexZeroPad(user.address, 32);
            const data = ethers.utils.defaultAbiCoder.encode(
                ["address", "uint256"],
                [user.address, amount]
            );

            const message = {
                messageId: messageId,
                sourceChainSelector: 138,
                sender: sender,
                data: data,
                destTokenAmounts: []
            };

            await expect(
                mockRouter.simulateMessageReceived(
                    crossChainMessenger.address,
                    message
                )
            ).to.be.revertedWith("Amount must be greater than 0");
        });
    });
});
