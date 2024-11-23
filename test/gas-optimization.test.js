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

describe("Gas Optimization Tests", function() {
    let crossChainMessenger;
    let owner;
    let user;
    let mockRouter;
    let mockWeth;
    let addr1;
    let addr2;

    beforeEach(async function() {
        const contracts = await deployTestContracts();
        owner = contracts.owner;
        user = contracts.user;
        addr1 = contracts.addr1;
        addr2 = contracts.addr2;
        mockRouter = contracts.mockRouter;
        mockWeth = contracts.mockWETH;
        crossChainMessenger = contracts.crossChainMessenger;
    });

    describe("Gas Usage Analysis", function() {
        it("Should optimize gas for message sending", async function() {
            const amount = ethers.parseEther("1.0");
            const message = {
                receiver: user.address,
                data: ethers.AbiCoder.defaultAbiCoder().encode(
                    ['address', 'uint256'],
                    [user.address, amount]
                ),
                tokenAmounts: [],
                feeToken: ethers.ZeroAddress,
                extraArgs: "0x"
            };
            const fee = await mockRouter.getFee(POLYGON_CHAIN_SELECTOR, message);
            const tx = await crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount + fee });
            const receipt = await tx.wait();
            expect(receipt.gasUsed).to.be.below(300000n, "Gas usage too high for message sending");
        });

        it("Should optimize gas for message receiving", async function() {
            // Fund the contract first
            await owner.sendTransaction({
                to: await crossChainMessenger.getAddress(),
                value: ethers.parseEther("10.0")
            });

            const amount = ethers.parseEther("1.0");
            const data = ethers.AbiCoder.defaultAbiCoder().encode(
                ['address', 'uint256'],
                [await user.getAddress(), amount]
            );

            const message = createCCIPMessage({
                sender: await owner.getAddress(),
                data: data
            });

            // Send message directly to the target using MockRouter's simulateMessageReceived function
            const tx = await mockRouter.simulateMessageReceived(
                await crossChainMessenger.getAddress(),
                message
            );
            const receipt = await tx.wait();
            expect(receipt.gasUsed).to.be.below(500000n, "Gas usage too high for message receiving");

            // Send message directly to the target using MockRouter's simulateMessageReceived function
            const tx = await mockRouter.simulateMessageReceived(
                await crossChainMessenger.getAddress(),
                message
            );
            const receipt = await tx.wait();
            expect(receipt.gasUsed).to.be.below(500000n, "Gas usage too high for message receiving");
        });
    });
});
