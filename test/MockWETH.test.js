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

describe("MockWETH", function() {
    let owner, user1, user2;
    let mockWETH;
    const INITIAL_SUPPLY = ethers.utils.parseEther("1000");
    const DEPOSIT_AMOUNT = ethers.utils.parseEther("1");

    beforeEach(async function() {
        [owner, user1, user2] = await ethers.getSigners();
        const MockWETH = await ethers.getContractFactory("MockWETH");
        mockWETH = await MockWETH.deploy("Wrapped Ether", "WETH");
        await mockWETH.deployed();
    });

    describe("Basic Functionality", function() {
        it("Should have correct name and symbol", async function() {
            expect(await mockWETH.name()).to.equal("Wrapped Ether");
            expect(await mockWETH.symbol()).to.equal("WETH");
        });

        it("Should have 18 decimals", async function() {
            expect(await mockWETH.decimals()).to.equal(18);
        });
    });

    describe("Deposit and Withdrawal", function() {
        it("Should allow ETH deposits", async function() {
            await mockWETH.connect(user1).deposit({ value: DEPOSIT_AMOUNT });
            expect(await mockWETH.balanceOf(user1.address)).to.equal(DEPOSIT_AMOUNT);
        });

        it("Should emit Deposit event", async function() {
            await expect(mockWETH.connect(user1).deposit({ value: DEPOSIT_AMOUNT }))
                .to.emit(mockWETH, "Deposit")
                .withArgs(user1.address, DEPOSIT_AMOUNT);
        });

        it("Should allow WETH withdrawals", async function() {
            await mockWETH.connect(user1).deposit({ value: DEPOSIT_AMOUNT });
            const initialBalance = await ethers.provider.getBalance(user1.address);
            const tx = await mockWETH.connect(user1).withdraw(DEPOSIT_AMOUNT);
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
            const finalBalance = await ethers.provider.getBalance(user1.address);

            // Calculate balance change using BigNumber operations
            const balanceChange = finalBalance.sub(initialBalance).add(gasUsed);
            expect(balanceChange).to.equal(DEPOSIT_AMOUNT);
            expect(await mockWETH.balanceOf(user1.address)).to.equal(0);
        });

        it("Should emit Withdrawal event", async function() {
            await mockWETH.connect(user1).deposit({ value: DEPOSIT_AMOUNT });
            await expect(mockWETH.connect(user1).withdraw(DEPOSIT_AMOUNT))
                .to.emit(mockWETH, "Withdrawal")
                .withArgs(user1.address, DEPOSIT_AMOUNT);
        });
    });

    describe("Edge Cases", function() {
        it("Should handle zero deposits", async function() {
            await expect(
                mockWETH.connect(user1).deposit({ value: 0 })
            ).to.not.be.reverted;
        });

        it("Should fail on zero address transfers", async function() {
            await mockWETH.connect(user1).deposit({ value: DEPOSIT_AMOUNT });
            await expect(
                mockWETH.connect(user1).transfer(ethers.constants.AddressZero, DEPOSIT_AMOUNT)
            ).to.be.revertedWith("ERC20: transfer to the zero address");
        });

        it("Should fail on withdrawing more than balance", async function() {
            await expect(
                mockWETH.connect(user1).withdraw(DEPOSIT_AMOUNT)
            ).to.be.revertedWith("ERC20: burn amount exceeds balance");
        });
    });
});
