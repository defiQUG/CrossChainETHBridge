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

describe("CrossChainMessenger Coverage Tests", function () {
    let messenger, owner, addr1, mockRouter, mockWETH, emergencyPause;

    beforeEach(async function () {
        const contracts = await deployTestContracts();
        owner = contracts.owner;
        addr1 = contracts.addr1;
        mockRouter = contracts.mockRouter;
        mockWETH = contracts.mockWETH;
        messenger = contracts.crossChainMessenger;
        emergencyPause = contracts.emergencyPause;
    });

    describe("Edge Cases and Error Handling", function () {
        it("Should handle zero amount transfers correctly", async function () {
            const recipient = addr1.address;
            const bridgeFee = await messenger.getBridgeFee();
            await expect(
                messenger.sendToPolygon(recipient, { value: bridgeFee })
            ).to.be.revertedWith("CrossChainMessenger: insufficient payment");
        });

        it("Should handle emergency withdrawals correctly", async function () {
            const pauseThreshold = await emergencyPause.pauseThreshold();
            const amount = pauseThreshold.add(ethers.utils.parseEther("1.0"));
            await emergencyPause.checkAndPause(amount);
            await owner.sendTransaction({
                to: messenger.address,
                value: amount
            });
            await messenger.emergencyWithdraw(owner.address);
            expect(await ethers.provider.getBalance(messenger.address)).to.equal(0n);
        });

        it("Should handle invalid chain ID correctly", async function () {
            const message = {
                messageId: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
                sourceChainSelector: POLYGON_CHAIN_SELECTOR,
                sender: ethers.utils.hexZeroPad(owner.address, 32),
                data: ethers.utils.defaultAbiCoder.encode(
                    ['address', 'uint256'],
                    [addr1.address, ethers.utils.parseEther("1.0")]
                ),
                destTokenAmounts: []
            };

            await expect(
                mockRouter.simulateMessageReceived(messenger.address, message)
            ).to.be.revertedWithCustomError(messenger, "InvalidSourceChain");
        });
    });
});
