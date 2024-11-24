const { ethers } = require("hardhat");
const { expect } = require("chai");
const { deployTestContracts, TEST_CONFIG } = require("./helpers/setup");

describe("CrossChainMessenger", function() {
    let owner, user, addr1, addr2;
    let mockRouter, mockWETH, crossChainMessenger;
    const {
        BRIDGE_FEE,
        MAX_FEE,
        MAX_MESSAGES_PER_PERIOD,
        PAUSE_THRESHOLD,
        PAUSE_DURATION,
        POLYGON_CHAIN_SELECTOR,
        DEFI_ORACLE_META_CHAIN_SELECTOR
    } = TEST_CONFIG;

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

    describe("Basic Functionality", function() {
        it("Should initialize with correct parameters", async function() {
            expect(await crossChainMessenger.router()).to.equal(mockRouter.address);
            expect(await crossChainMessenger.weth()).to.equal(mockWETH.address);
            expect(await crossChainMessenger.bridgeFee()).to.equal(BRIDGE_FEE);
        });
    });

    describe("Message Sending", function() {
        it("Should send message to Polygon with specific message ID", async function() {
            const amount = ethers.utils.parseEther("1");
            const transferAmount = amount - BRIDGE_FEE;
            const expectedMessageId = ethers.id("testMessage");
            await mockRouter.setNextMessageId(expectedMessageId);

            const tx = await crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount });
            const receipt = await tx.wait();

            const event = receipt.events.find(e => e.event === 'MessageSent');
            expect(event).to.not.be.undefined;
            expect(event.args.messageId).to.equal(expectedMessageId);
            expect(event.args.sender).to.equal(user.address);
            expect(event.args.recipient).to.equal(user.address);
            expect(event.args.amount).to.equal(transferAmount);
        });

        it("Should enforce rate limiting", async function() {
            const amount = ethers.utils.parseEther("1");

            for (let i = 0; i < MAX_MESSAGES_PER_PERIOD; i++) {
                await crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount });
            }

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

            expect(await crossChainMessenger.isPaused()).to.be.true;

            await ethers.provider.send("evm_increaseTime", [PAUSE_DURATION + 1]);
            await ethers.provider.send("evm_mine");

            expect(await crossChainMessenger.isPaused()).to.be.false;
        });

        it("Should prevent sending when paused", async function() {
            const amount = ethers.utils.parseEther("1");
            await crossChainMessenger.sendToPolygon(addr1.address, { value: PAUSE_THRESHOLD });
            expect(await crossChainMessenger.isPaused()).to.be.true;

            await expect(
                crossChainMessenger.sendToPolygon(addr1.address, { value: amount })
            ).to.be.revertedWith("EmergencyPause: contract is paused");
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

            const message = {
                messageId: messageId,
                sourceChainSelector: 138,
                sender: sender,
                data: data,
                destTokenAmounts: []
            };

            await mockRouter.simulateMessageReceived(
                crossChainMessenger.address,
                message
            );

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

            const message = {
                messageId: messageId,
                sourceChainSelector: 1,
                sender: sender,
                data: data,
                destTokenAmounts: []
            };

            await expect(
                mockRouter.simulateMessageReceived(
                    crossChainMessenger.address,
                    message
                )
            ).to.be.revertedWith("CrossChainMessenger: invalid source chain");
        });

        it("Should enforce rate limiting on message receiving", async function() {
            const amount = ethers.utils.parseEther("1");
            const sender = ethers.utils.hexZeroPad(user.address, 32);
            const data = ethers.utils.defaultAbiCoder.encode(
                ["address", "uint256"],
                [user.address, amount]
            );

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
            ).to.be.revertedWith("RateLimiter: rate limit exceeded");
        });

        it("Should handle zero amount transfers", async function() {
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
            ).to.be.revertedWith("CrossChainMessenger: zero amount");
        });
    });

    describe("Fee Management", function() {
        it("Should have correct initial fee", async function() {
            expect(await crossChainMessenger.bridgeFee()).to.equal(BRIDGE_FEE);
        });

        it("Should allow owner to update fee", async function() {
            const newFee = ethers.utils.parseEther("0.2");
            await expect(crossChainMessenger.setBridgeFee(newFee))
                .to.emit(crossChainMessenger, "BridgeFeeUpdated")
                .withArgs(newFee);
            expect(await crossChainMessenger.bridgeFee()).to.equal(newFee);
        });

        it("Should prevent non-owner from updating fee", async function() {
            const newFee = ethers.utils.parseEther("0.2");
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
            const slightlyAboveFee = BRIDGE_FEE + ethers.utils.parseEther("0.0001");
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
            const amount = ethers.utils.parseEther("1.0");

            for (let i = 0; i < MAX_MESSAGES_PER_PERIOD; i++) {
                await crossChainMessenger.sendToPolygon(addr1.address, { value: amount });
            }

            await expect(
                crossChainMessenger.sendToPolygon(addr1.address, { value: amount })
            ).to.be.revertedWith("RateLimiter: rate limit exceeded");
        });

        it("Should allow owner to recover ETH", async function() {
            const amount = ethers.utils.parseEther("1.0");
            await owner.sendTransaction({
                to: crossChainMessenger.address,
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
                ethers.utils.parseEther("0.001")
            );
        });
    });

    describe("Gas Optimization", function() {
        it("Should optimize gas for message sending", async function() {
            const amount = ethers.utils.parseEther("1");
            const tx = await crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount });
            const receipt = await tx.wait();
            expect(receipt.gasUsed).to.be.below(200000);
        });

        it("Should optimize gas for message receiving", async function() {
            const amount = ethers.utils.parseEther("1");
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

            const tx = await mockRouter.simulateMessageReceived(
                crossChainMessenger.address,
                message
            );
            const receipt = await tx.wait();
            expect(receipt.gasUsed).to.be.below(250000);
        });
    });

    describe("CCIP Integration", function() {
        it("Should validate CCIP message format", async function() {
            const amount = ethers.utils.parseEther("1");
            const messageId = ethers.utils.randomBytes(32);
            const sender = ethers.utils.hexZeroPad(user.address, 32);
            const invalidData = ethers.utils.defaultAbiCoder.encode(
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
                    crossChainMessenger.address,
                    message
                )
            ).to.be.revertedWith("CrossChainMessenger: invalid message format");
        });

        it("Should handle CCIP fees correctly", async function() {
            const amount = ethers.utils.parseEther("2");
            const extraFee = ethers.utils.parseEther("0.5");
            await mockRouter.setExtraFee(extraFee);

            const tx = await crossChainMessenger.connect(user).sendToPolygon(user.address, {
                value: amount + extraFee
            });
            const receipt = await tx.wait();

            const event = receipt.events.find(e => e.event === 'MessageSent');
            expect(event.args.amount).to.equal(amount - BRIDGE_FEE);
        });

        it("Should validate destination token amounts", async function() {
            const amount = ethers.utils.parseEther("1");
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
                destTokenAmounts: [{
                    token: mockWETH.address,
                    amount: amount + 1n
                }]
            };

            await expect(
                mockRouter.simulateMessageReceived(
                    crossChainMessenger.address,
                    message
                )
            ).to.be.revertedWith("CrossChainMessenger: invalid token amount");
        });
    });
});
