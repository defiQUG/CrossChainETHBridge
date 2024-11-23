const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("CrossChainMessenger", function() {
    let owner, user, addr1, addr2;
    let mockRouter, mockWETH, crossChainMessenger;
    const POLYGON_CHAIN_SELECTOR = 137;
    const MAX_MESSAGES_PER_PERIOD = 5;
    const BRIDGE_FEE = ethers.parseEther("0.1");
    const MAX_FEE = ethers.parseEther("1.0");
    const PAUSE_THRESHOLD = ethers.parseEther("5.0");
    const PAUSE_DURATION = 3600; // 1 hour

    beforeEach(async function() {
        [owner, user, addr1, addr2] = await ethers.getSigners();

        // Deploy contracts
        const MockWETH = await ethers.getContractFactory("MockWETH");
        mockWETH = await MockWETH.deploy("Wrapped Ether", "WETH");
        await mockWETH.waitForDeployment();

        const MockRouter = await ethers.getContractFactory("MockRouter");
        mockRouter = await MockRouter.deploy();
        await mockRouter.waitForDeployment();

        const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
        crossChainMessenger = await CrossChainMessenger.deploy(
            await mockRouter.getAddress(),
            await mockWETH.getAddress(),
            BRIDGE_FEE,
            MAX_FEE,
            MAX_MESSAGES_PER_PERIOD,
            PAUSE_THRESHOLD,
            PAUSE_DURATION
        );
        await crossChainMessenger.waitForDeployment();

        // Fund the contract for tests
        await owner.sendTransaction({
            to: await crossChainMessenger.getAddress(),
            value: ethers.parseEther("10.0")
        });
    });

    describe("Basic Functionality", function() {
        it("Should initialize with correct parameters", async function() {
            expect(await crossChainMessenger.router()).to.equal(await mockRouter.getAddress());
            expect(await crossChainMessenger.weth()).to.equal(await mockWETH.getAddress());
            expect(await crossChainMessenger.bridgeFee()).to.equal(BRIDGE_FEE);
        });
    });

    describe("Message Sending", function() {
        it("Should send message to Polygon", async function() {
            const amount = ethers.parseEther("1");
            const transferAmount = amount - BRIDGE_FEE;

            const tx = await crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount });
            const receipt = await tx.wait();

            const event = receipt.events.find(e => e.event === 'MessageSent');
            expect(event).to.not.be.undefined;
            expect(event.args.sender).to.equal(user.address);
            expect(event.args.recipient).to.equal(user.address);
            expect(event.args.amount).to.equal(transferAmount);
        });

        it("Should enforce rate limiting", async function() {
            const amount = ethers.parseEther("1");

            // Send messages up to the limit
            for (let i = 0; i < MAX_MESSAGES_PER_PERIOD; i++) {
                await crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount });
            }

            // Next message should fail
            await expect(
                crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount })
            ).to.be.revertedWith("RateLimiter: rate limit exceeded");
        });

        it("Should fail when sending with insufficient amount", async function() {
            const insufficientAmount = BRIDGE_FEE / 2n;
            await expect(
                crossChainMessenger.sendToPolygon(addr1.address, {
                    value: insufficientAmount
                })
            ).to.be.revertedWith("CrossChainMessenger: insufficient payment");
        });
    });

    describe("Security Features", function() {
        it("Should handle emergency pause correctly", async function() {
            const largeAmount = PAUSE_THRESHOLD;
            await expect(
                crossChainMessenger.sendToPolygon(addr1.address, { value: largeAmount })
            ).to.be.revertedWith("EmergencyPause: threshold exceeded");

            // Should be paused now
            expect(await crossChainMessenger.isPaused()).to.be.true;

            // Wait for pause duration
            await ethers.provider.send("evm_increaseTime", [PAUSE_DURATION + 1]);
            await ethers.provider.send("evm_mine");

            // Should be automatically unpaused
            expect(await crossChainMessenger.isPaused()).to.be.false;
        });

        it("Should prevent sending when paused", async function() {
            const amount = ethers.parseEther("1");
            await crossChainMessenger.sendToPolygon(addr1.address, { value: PAUSE_THRESHOLD });
            expect(await crossChainMessenger.isPaused()).to.be.true;

            await expect(
                crossChainMessenger.sendToPolygon(addr1.address, { value: amount })
            ).to.be.revertedWith("EmergencyPause: contract is paused");
        });
    });

    describe("Message Receiving", function() {
        it("Should receive message and convert to WETH", async function() {
            const amount = ethers.parseEther("1");
            const messageId = ethers.randomBytes(32);
            const sender = ethers.zeroPadValue(user.address, 32);
            const data = ethers.AbiCoder.defaultAbiCoder().encode(
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

            await mockRouter.simulateMessageReceived(
                await crossChainMessenger.getAddress(),
                message
            );

            const transferFilter = mockWETH.filters.Transfer(await crossChainMessenger.getAddress(), user.address);
            const events = await mockWETH.queryFilter(transferFilter);
            expect(events.length).to.equal(1);
            expect(events[0].args.value).to.equal(amount);
        });

        it("Should reject messages from invalid source chain", async function() {
            const amount = ethers.parseEther("1");
            const messageId = ethers.randomBytes(32);
            const sender = ethers.zeroPadValue(user.address, 32);
            const data = ethers.AbiCoder.defaultAbiCoder().encode(
                ["address", "uint256"],
                [user.address, amount]
            );

            const message = {
                messageId: messageId,
                sourceChainSelector: 1,
                sender: sender,
                data: data,
                destTokenAmounts: []
            };

            await expect(
                mockRouter.simulateMessageReceived(
                    await crossChainMessenger.getAddress(),
                    message
                )
            ).to.be.revertedWith("Invalid source chain");
        });

        it("Should enforce rate limiting on message receiving", async function() {
            const amount = ethers.parseEther("1");
            const sender = ethers.zeroPadValue(user.address, 32);
            const data = ethers.AbiCoder.defaultAbiCoder().encode(
                ["address", "uint256"],
                [user.address, amount]
            );

            // Send messages up to the limit
            for (let i = 0; i < MAX_MESSAGES_PER_PERIOD; i++) {
                const message = {
                    messageId: ethers.randomBytes(32),
                    sourceChainSelector: 138,
                    sender: sender,
                    data: data,
                    destTokenAmounts: []
                };

                await mockRouter.simulateMessageReceived(
                    await crossChainMessenger.getAddress(),
                    message
                );
            }

            // Next message should fail
            const message = {
                messageId: ethers.randomBytes(32),
                sourceChainSelector: 138,
                sender: sender,
                data: data,
                destTokenAmounts: []
            };

            await expect(
                mockRouter.simulateMessageReceived(
                    await crossChainMessenger.getAddress(),
                    message
                )
            ).to.be.revertedWith("RateLimiter: rate limit exceeded");
        });

        it("Should handle zero amount transfers", async function() {
            const amount = ethers.parseEther("0");
            const messageId = ethers.randomBytes(32);
            const sender = ethers.zeroPadValue(user.address, 32);
            const data = ethers.AbiCoder.defaultAbiCoder().encode(
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
                    await crossChainMessenger.getAddress(),
                    message
                )
            ).to.be.revertedWith("CrossChainMessenger: zero amount");
        });
    });

    describe("Fee Management", function() {
        it("Should have correct initial fee", async function() {
            expect(await crossChainMessenger.bridgeFee()).to.equal(BRIDGE_FEE);
        });

        it("Should allow owner to update fee", async function() {
            const newFee = ethers.parseEther("0.2");
            await expect(crossChainMessenger.setBridgeFee(newFee))
                .to.emit(crossChainMessenger, "BridgeFeeUpdated")
                .withArgs(newFee);
            expect(await crossChainMessenger.bridgeFee()).to.equal(newFee);
        });

        it("Should prevent non-owner from updating fee", async function() {
            const newFee = ethers.parseEther("0.2");
            await expect(
                crossChainMessenger.connect(addr1).setBridgeFee(newFee)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should prevent setting fee above maximum", async function() {
            await expect(
                crossChainMessenger.setBridgeFee(MAX_FEE + 1n)
            ).to.be.revertedWith("CrossChainMessenger: fee exceeds maximum");
        });

        it("Should accept transaction when amount slightly exceeds fee", async function() {
            const slightlyAboveFee = BRIDGE_FEE + ethers.parseEther("0.0001");
            const tx = await crossChainMessenger.sendToPolygon(addr1.address, {
                value: slightlyAboveFee
            });

            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === 'MessageSent');
            expect(event).to.not.be.undefined;
            expect(event.args.sender).to.equal(owner.address);
            expect(event.args.recipient).to.equal(addr1.address);
            expect(event.args.amount).to.equal(slightlyAboveFee - BRIDGE_FEE);
        });
    });

    describe("Emergency Functions", function() {
        it("Should handle emergency pause correctly", async function() {
            const largeAmount = PAUSE_THRESHOLD;
            await expect(
                crossChainMessenger.sendToPolygon(addr1.address, { value: largeAmount })
            ).to.be.revertedWith("EmergencyPause: threshold exceeded");

            expect(await crossChainMessenger.isPaused()).to.be.true;

            await ethers.provider.send("evm_increaseTime", [PAUSE_DURATION + 1]);
            await ethers.provider.send("evm_mine");

            expect(await crossChainMessenger.isPaused()).to.be.false;
        });

        it("Should enforce rate limiting", async function() {
            const amount = ethers.parseEther("1.0");

            for (let i = 0; i < MAX_MESSAGES_PER_PERIOD; i++) {
                await crossChainMessenger.sendToPolygon(addr1.address, { value: amount });
            }

            await expect(
                crossChainMessenger.sendToPolygon(addr1.address, { value: amount })
            ).to.be.revertedWith("RateLimiter: rate limit exceeded");
        });

        it("Should allow owner to recover ETH", async function() {
            const amount = ethers.parseEther("1.0");
            await owner.sendTransaction({
                to: await crossChainMessenger.getAddress(),
                value: amount
            });

            const ownerBalance = await ethers.provider.getBalance(owner.address);
            await crossChainMessenger.sendToPolygon(addr1.address, { value: PAUSE_THRESHOLD });

            await expect(crossChainMessenger.emergencyWithdraw(owner.address))
                .to.emit(crossChainMessenger, "EmergencyWithdraw")
                .withArgs(owner.address, amount);

            const finalBalance = await ethers.provider.getBalance(owner.address);
            expect(finalBalance - ownerBalance).to.be.closeTo(
                amount,
                ethers.parseEther("0.001")
            );
        });
    });

    describe("Gas Optimization", function() {
        it("Should optimize gas for message sending", async function() {
            const amount = ethers.parseEther("1");
            const tx = await crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount });
            const receipt = await tx.wait();
            expect(receipt.gasUsed).to.be.below(200000);
        });

        it("Should optimize gas for message receiving", async function() {
            const amount = ethers.parseEther("1");
            const messageId = ethers.randomBytes(32);
            const sender = ethers.zeroPadValue(user.address, 32);
            const data = ethers.AbiCoder.defaultAbiCoder().encode(
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

            const tx = await mockRouter.simulateMessageReceived(
                await crossChainMessenger.getAddress(),
                message
            );
            const receipt = await tx.wait();
            expect(receipt.gasUsed).to.be.below(250000);
        });
    });

    describe("CCIP Integration", function() {
        it("Should validate CCIP message format", async function() {
            const amount = ethers.parseEther("1");
            const messageId = ethers.randomBytes(32);
            const sender = ethers.zeroPadValue(user.address, 32);
            const invalidData = ethers.AbiCoder.defaultAbiCoder().encode(
                ["address", "uint256", "bytes"],
                [user.address, amount, "0x"]
            );

            const message = {
                messageId: messageId,
                sourceChainSelector: 138,
                sender: sender,
                data: invalidData,
                destTokenAmounts: []
            };

            await expect(
                mockRouter.simulateMessageReceived(
                    await crossChainMessenger.getAddress(),
                    message
                )
            ).to.be.revertedWith("Invalid message format");
        });

        it("Should handle CCIP fees correctly", async function() {
            const amount = ethers.parseEther("2");
            const extraFee = ethers.parseEther("0.5");
            await mockRouter.setExtraFee(extraFee);

            const tx = await crossChainMessenger.connect(user).sendToPolygon(user.address, {
                value: amount + extraFee
            });
            const receipt = await tx.wait();

            const event = receipt.events.find(e => e.event === 'MessageSent');
            expect(event.args.amount).to.equal(amount - BRIDGE_FEE);
        });

        it("Should validate destination token amounts", async function() {
            const amount = ethers.parseEther("1");
            const messageId = ethers.randomBytes(32);
            const sender = ethers.zeroPadValue(user.address, 32);
            const data = ethers.AbiCoder.defaultAbiCoder().encode(
                ["address", "uint256"],
                [user.address, amount]
            );

            const message = {
                messageId: messageId,
                sourceChainSelector: 138,
                sender: sender,
                data: data,
                destTokenAmounts: [{
                    token: await mockWETH.getAddress(),
                    amount: amount + 1n
                }]
            };

            await expect(
                mockRouter.simulateMessageReceived(
                    await crossChainMessenger.getAddress(),
                    message
                )
            ).to.be.revertedWith("Invalid token amount");
        });
    });
});
