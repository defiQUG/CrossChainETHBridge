const { ethers } = require("hardhat");
const { expect } = require("chai");
const { deployTestContracts, TEST_CONFIG } = require("./helpers/setup");

describe("CrossChainMessenger Edge Cases", function() {
    let owner, user, addr1, addr2;
    let mockRouter, mockWETH, crossChainMessenger;
    const {
        BRIDGE_FEE,
        MAX_FEE,
        PAUSE_THRESHOLD,
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

    describe("Error Handling", function() {
        it("Should handle malformed message data", async function() {
            const amount = ethers.utils.parseEther("1");
            const messageId = ethers.utils.randomBytes(32);
            const sender = ethers.utils.hexZeroPad(user.address, 32);
            const malformedData = ethers.utils.defaultAbiCoder.encode(
                ["address", "uint256", "bytes32"],
                [user.address, amount, ethers.utils.randomBytes(32)]
            );

            const message = {
                messageId: messageId,
                sourceChainSelector: DEFI_ORACLE_META_CHAIN_SELECTOR,
                sender: sender,
                data: malformedData,
                destTokenAmounts: []
            };

            await expect(
                mockRouter.simulateMessageReceived(
                    crossChainMessenger.address,
                    message
                )
            ).to.be.revertedWith("CrossChainMessenger: invalid message format");
        });

        it("Should handle message with invalid recipient", async function() {
            const amount = ethers.utils.parseEther("1");
            const messageId = ethers.utils.randomBytes(32);
            const sender = ethers.utils.hexZeroPad(user.address, 32);
            const invalidData = ethers.utils.defaultAbiCoder.encode(
                ["address", "uint256"],
                [ethers.constants.AddressZero, amount]
            );

            const message = {
                messageId: messageId,
                sourceChainSelector: DEFI_ORACLE_META_CHAIN_SELECTOR,
                sender: sender,
                data: invalidData,
                destTokenAmounts: []
            };

            await expect(
                mockRouter.simulateMessageReceived(
                    crossChainMessenger.address,
                    message
                )
            ).to.be.revertedWith("CrossChainMessenger: invalid recipient");
        });

        it("Should handle WETH transfer failures", async function() {
            const amount = ethers.utils.parseEther("1");
            const messageId = ethers.utils.randomBytes(32);
            const sender = ethers.utils.hexZeroPad(user.address, 32);
            const data = ethers.utils.defaultAbiCoder.encode(
                ["address", "uint256"],
                [user.address, amount]
            );

            // Make WETH transfer fail
            await mockWETH.setTransferFail(true);

            const message = {
                messageId: messageId,
                sourceChainSelector: DEFI_ORACLE_META_CHAIN_SELECTOR,
                sender: sender,
                data: data,
                destTokenAmounts: []
            };

            await expect(
                mockRouter.simulateMessageReceived(
                    crossChainMessenger.address,
                    message
                )
            ).to.be.revertedWith("CrossChainMessenger: WETH transfer failed");
        });
    });

    describe("Security Edge Cases", function() {
        it("Should handle multiple rapid transfers near threshold", async function() {
            const amount = PAUSE_THRESHOLD - ethers.utils.parseEther("0.1");

            // Send multiple transfers rapidly
            await crossChainMessenger.sendToPolygon(addr1.address, { value: amount });
            await crossChainMessenger.sendToPolygon(addr2.address, { value: amount });

            // This should trigger pause
            await expect(
                crossChainMessenger.sendToPolygon(user.address, { value: amount })
            ).to.be.revertedWith("EmergencyPause: threshold exceeded");

            expect(await crossChainMessenger.isPaused()).to.be.true;
        });

        it("Should handle message replay attempts", async function() {
            const amount = ethers.utils.parseEther("1");
            const messageId = ethers.utils.randomBytes(32);
            const sender = ethers.utils.hexZeroPad(user.address, 32);
            const data = ethers.utils.defaultAbiCoder.encode(
                ["address", "uint256"],
                [user.address, amount]
            );

            const message = {
                messageId: messageId,
                sourceChainSelector: DEFI_ORACLE_META_CHAIN_SELECTOR,
                sender: sender,
                data: data,
                destTokenAmounts: []
            };

            // First message should succeed
            await mockRouter.simulateMessageReceived(
                crossChainMessenger.address,
                message
            );

            // Replay should fail
            await expect(
                mockRouter.simulateMessageReceived(
                    crossChainMessenger.address,
                    message
                )
            ).to.be.revertedWith("CrossChainMessenger: message already processed");
        });
    });
});
