const { expect } = require("chai");
const { ethers } = require("hardhat");
const { Client } = require("./helpers/Client");

describe("CrossChainMessenger", function() {
    let owner;
    let user;
    let addr1;
    let addr2;
    let mockRouter;
    let mockWETH;
    let crossChainMessenger;
    const POLYGON_CHAIN_SELECTOR = 137;
    const MAX_MESSAGES_PER_PERIOD = 5;
    const BRIDGE_FEE = ethers.utils.parseEther("0.1");
    const MAX_FEE = ethers.utils.parseEther("1.0");

    beforeEach(async function() {
        [owner, user, addr1, addr2] = await ethers.getSigners();

        // Deploy MockWETH
        const MockWETH = await ethers.getContractFactory("MockWETH");
        mockWETH = await MockWETH.deploy("Wrapped Ether", "WETH");
        await mockWETH.deployed();

        // Deploy MockRouter
        const MockRouter = await ethers.getContractFactory("MockRouter");
        mockRouter = await MockRouter.deploy();
        await mockRouter.deployed();

        // Deploy CrossChainMessenger with correct parameters
        const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
        crossChainMessenger = await CrossChainMessenger.deploy(
            mockRouter.address,
            mockWETH.address,
            5  // maxMessagesPerPeriod
        );
        await crossChainMessenger.deployed();

        // Fund the contract for tests
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
            expect(await crossChainMessenger.bridgeFee()).to.equal(BRIDGE_FEE);
        });
    });

    describe("Message Sending", function() {
        it("Should send message to Polygon", async function() {
            const amount = ethers.utils.parseEther("1");
            const transferAmount = amount.sub(BRIDGE_FEE);

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

        it("Should fail when sending with insufficient amount", async function() {
            const insufficientAmount = BRIDGE_FEE.div(2);
            await expect(
                crossChainMessenger.sendToPolygon(addr1.address, {
                    value: insufficientAmount
                })
            ).to.be.revertedWith("CrossChainMessenger: insufficient payment");
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
            ).to.be.revertedWith("Invalid source chain");
        });

        it("Should enforce rate limiting on message receiving (edge case)", async function() {
            const amount = ethers.utils.parseEther("1");
            const sender = ethers.utils.hexZeroPad(user.address, 32);
            const data = ethers.utils.defaultAbiCoder.encode(
                ["address", "uint256"],
                [user.address, amount]
            );

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

            // Next message should fail
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
            ).to.be.revertedWith("Rate limit exceeded");
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
            const maxFee = ethers.utils.parseEther("1.0");
            await expect(
                crossChainMessenger.setBridgeFee(maxFee.add(1))
            ).to.be.revertedWith("CrossChainMessenger: fee exceeds maximum");
        });

        it("Should accept transaction when amount slightly exceeds fee", async function() {
            const slightlyAboveFee = BRIDGE_FEE.add(ethers.utils.parseEther("0.0001"));
            const tx = await crossChainMessenger.sendToPolygon(addr1.address, {
                value: slightlyAboveFee
            });
            await expect(tx)
                .to.emit(crossChainMessenger, "MessageSent")
                .withArgs(
                    await crossChainMessenger.router().ccipSend.call(this, POLYGON_CHAIN_SELECTOR, {
                        receiver: ethers.utils.defaultAbiCoder.encode(["address"], [addr1.address]),
                        data: ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [addr1.address, slightlyAboveFee.sub(BRIDGE_FEE)]),
                        tokenAmounts: [],
                        extraArgs: "",
                        feeToken: ethers.constants.AddressZero
                    }),
                    owner.address,
                    slightlyAboveFee.sub(BRIDGE_FEE),
                    BRIDGE_FEE
                );
        });
    });

    describe("Emergency Functions", function() {
        it("Should allow owner to pause", async function() {
            await crossChainMessenger.pause();
            expect(await crossChainMessenger.paused()).to.be.true;
        });

        it("Should allow owner to unpause", async function() {
            await crossChainMessenger.pause();
            await crossChainMessenger.unpause();
            expect(await crossChainMessenger.paused()).to.be.false;
        });

        it("Should prevent non-owner from pausing", async function() {
            await expect(
                crossChainMessenger.connect(addr1).pause()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should prevent bridging when paused", async function() {
            await crossChainMessenger.pause();
            await expect(
                crossChainMessenger.sendToPolygon(addr1.address, { value: ethers.utils.parseEther("1.0") })
            ).to.be.revertedWith("Pausable: paused");
        });

        it("Should allow owner to recover ETH", async function() {
            // Clear any existing balance first
            await crossChainMessenger.pause();
            const initialContractBalance = await ethers.provider.getBalance(crossChainMessenger.address);
            if (initialContractBalance.gt(0)) {
                await crossChainMessenger.emergencyWithdraw(owner.address);
            }
            await crossChainMessenger.unpause();

            // Now send a specific amount and test withdrawal
            const amount = ethers.utils.parseEther("1.0");
            await owner.sendTransaction({
                to: crossChainMessenger.address,
                value: amount
            });

            await crossChainMessenger.pause();
            const ownerBalance = await owner.getBalance();

            await expect(crossChainMessenger.emergencyWithdraw(owner.address))
                .to.emit(crossChainMessenger, "EmergencyWithdraw")
                .withArgs(owner.address, amount);

            const finalBalance = await owner.getBalance();
            expect(finalBalance.sub(ownerBalance)).to.be.closeTo(
                amount,
                ethers.utils.parseEther("0.001") // Account for gas
            );
        });
    });
});
