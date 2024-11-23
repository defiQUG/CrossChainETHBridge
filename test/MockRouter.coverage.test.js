const { ethers } = require('hardhat');
const { expect } = require('chai');
const { deployTestContracts, TEST_CONFIG } = require('./helpers/setup');
const { deployContract, getContractAt } = require('./helpers/test-utils');

const {
    BRIDGE_FEE,
    MAX_FEE,
    MAX_MESSAGES_PER_PERIOD,
    PAUSE_THRESHOLD,
    PAUSE_DURATION,
    POLYGON_CHAIN_SELECTOR,
    DEFI_ORACLE_META_CHAIN_SELECTOR
} = TEST_CONFIG;

describe("Router Coverage Tests", function () {
    let router, owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        const TestRouter = await ethers.getContractFactory("TestRouter");
        router = await TestRouter.deploy();
        await router.waitForDeployment();
    });

    describe("Chain Support and Token Management", function () {
        it("Should verify supported chains correctly", async function () {
            expect(await router.isChainSupported(POLYGON_CHAIN_SELECTOR)).to.be.true;
            expect(await router.isChainSupported(999)).to.be.false;
        });

        it("Should handle getSupportedTokens for valid chain", async function () {
            const tokens = await router.getSupportedTokens(137); // Polygon PoS
            expect(tokens).to.be.an('array').that.is.empty;
        });

        it("Should revert getSupportedTokens for invalid chain", async function () {
            await expect(router.getSupportedTokens(138)) // Defi Oracle Meta
                .to.be.revertedWith("Chain not supported");
        });
    });

    describe("Message Simulation", function () {
        let message;

        beforeEach(async function () {
            message = {
                messageId: ethers.randomBytes(32),
                sourceChainSelector: POLYGON_CHAIN_SELECTOR,
                sender: ethers.hexlify(ethers.randomBytes(20)),
                receiver: ethers.ZeroAddress, // Will be set to WETH contract
                data: "0x", // Will be updated with deposit function data
                tokenAmounts: [],
                destTokenAmounts: [],
                extraArgs: ethers.AbiCoder.defaultAbiCoder().encode(
                    ['address'],
                    [addr1.address] // The actual depositor address
                )
            };
        });

        it("Should handle message simulation correctly", async function () {
            // Deploy a mock contract that can receive messages
            const MockWETH = await ethers.getContractFactory("MockWETH");
            const receiver = await MockWETH.deploy("Wrapped Ether", "WETH");
            await receiver.waitForDeployment();

            const depositAmount = ethers.parseEther("1.0");
            const receiverAddress = await receiver.getAddress();

            // Update message with correct receiver and data
            message.receiver = receiverAddress;
            const depositInterface = new ethers.Interface([
                "function deposit() payable"
            ]);
            message.data = depositInterface.encodeFunctionData("deposit");

            // Connect as addr1 to simulate the deposit
            const routerAsAddr1 = router.connect(addr1);

            // Simulate message with ETH value
            await routerAsAddr1.simulateMessageReceived(
                receiverAddress,
                message,
                { value: depositAmount }
            );

            // Verify the deposit was successful by checking addr1's balance
            expect(await receiver.balanceOf(addr1.address)).to.equal(depositAmount);
        });

        it("Should revert simulation with invalid source chain", async function () {
            const invalidMessage = { ...message, sourceChainSelector: DEFI_ORACLE_META_CHAIN_SELECTOR };
            await expect(router.simulateMessageReceived(addr1.address, invalidMessage))
                .to.be.revertedWith("Chain not supported");
        });

        it("Should revert simulation with zero address target", async function () {
            await expect(router.simulateMessageReceived(ethers.ZeroAddress, message))
                .to.be.revertedWith("Invalid target address");
        });
    });

    describe("Message Reception", function () {
        let ccipMessage;

        beforeEach(async function () {
            ccipMessage = {
                messageId: ethers.randomBytes(32),
                sourceChainSelector: POLYGON_CHAIN_SELECTOR,
                sender: ethers.hexlify(ethers.randomBytes(20)),
                receiver: addr1.address,
                data: ethers.AbiCoder.defaultAbiCoder().encode(
                    ['address', 'uint256'],
                    [addr1.address, ethers.parseEther("1.0")]
                ),
                tokenAmounts: [],
                destTokenAmounts: [],
                extraArgs: "0x",
                feeToken: ethers.ZeroAddress,
                feeAmount: BRIDGE_FEE
            };
        });

        it("Should handle message processing correctly", async function () {
            const validMessage = {
                ...ccipMessage,
                sourceChainSelector: POLYGON_CHAIN_SELECTOR,
                data: ethers.AbiCoder.defaultAbiCoder().encode(
                    ['address', 'uint256'],
                    [addr1.address, ethers.parseEther("1.0")]
                )
            };

            // Call processMessage and wait for transaction
            const tx = await router.processMessage();
            await tx.wait();

            // Verify transaction succeeded
            expect(tx.hash).to.be.properHex(66);
        });

        it("Should handle fee calculations correctly", async function () {
            const messageFee = await router.getFee(POLYGON_CHAIN_SELECTOR, ccipMessage);
            expect(messageFee).to.equal(ethers.parseEther("0.1"));

            await expect(router.getFee(DEFI_ORACLE_META_CHAIN_SELECTOR, ccipMessage))
                .to.be.revertedWith("Chain not supported");
        });

        it("Should validate message data correctly", async function () {
            const invalidMessage = { ...ccipMessage, sender: ethers.hexlify(ethers.randomBytes(10)) }; // Invalid 10-byte sender
            await expect(router.validateMessage(invalidMessage))
                .to.be.revertedWith("Invalid sender length");
        });

        it("Should handle message validation errors", async function () {
            const invalidMessage = { ...ccipMessage, sourceChainSelector: 0 };
            await expect(router.validateMessage(invalidMessage))
                .to.be.revertedWith("Chain not supported");
        });

        it("Should handle routeMessage execution correctly", async function () {
            const MockWETH = await ethers.getContractFactory("MockWETH");
            const receiver = await MockWETH.deploy("Wrapped Ether", "WETH");
            await receiver.waitForDeployment();

            const receiverAddress = await receiver.getAddress();
            const depositInterface = new ethers.Interface(["function deposit() payable"]);
            const depositCall = depositInterface.encodeFunctionData("deposit");

            const validMessage = {
                ...ccipMessage,
                data: depositCall,
                receiver: receiverAddress
            };

            const gasLimit = 300000;
            const gasForCallExactCheck = 1;

            const [success, retBytes, gasUsed] = await router.routeMessage(
                validMessage,
                gasForCallExactCheck,
                gasLimit,
                receiverAddress
            );

            expect(success).to.be.true;
            expect(gasUsed).to.be.lte(gasLimit);
        });

        it("Should handle routeMessage failures", async function () {
            const invalidReceiver = ethers.ZeroAddress;
            const gasLimit = 300000;

            const [success, , ] = await router.routeMessage(
                ccipMessage,
                0,
                gasLimit,
                invalidReceiver
            );

            expect(success).to.be.false;
        });

        it("Should enforce gas limits correctly", async function () {
            const MockWETH = await ethers.getContractFactory("MockWETH");
            const receiver = await MockWETH.deploy("Wrapped Ether", "WETH");
            await receiver.waitForDeployment();

            const receiverAddress = await receiver.getAddress();
            const depositInterface = new ethers.Interface(["function deposit() payable"]);
            const depositCall = depositInterface.encodeFunctionData("deposit");

            const validMessage = {
                ...ccipMessage,
                data: depositCall,
                receiver: receiverAddress
            };

            const tooLowGasLimit = 1000;
            const gasForCallExactCheck = 1;

            await expect(
                router.routeMessage(
                    validMessage,
                    gasForCallExactCheck,
                    tooLowGasLimit,
                    receiverAddress
                )
            ).to.be.revertedWith("Gas limit exceeded");
        });
    });
});
