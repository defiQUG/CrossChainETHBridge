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
    const INITIAL_SUPPLY = ethers.parseEther("1000");
    const DEPOSIT_AMOUNT = ethers.parseEther("1");
    beforeEach(async function() {
    const contracts = await deployTestContracts();
    owner = contracts.owner;
    user = contracts.user;
    addr1 = contracts.addr1;
    addr2 = contracts.addr2;
    mockRouter = contracts.mockRouter;
    mockWETH = contracts.mockWETH;
    crossChainMessenger = contracts.crossChainMessenger;
        [owner, user1, user2] = await ethers.getSigners();
        const MockWETH = await ethers.getContractFactory("MockWETH");
        mockWETH = await MockWETH.deploy("Wrapped Ether", "WETH");
        await mockWETH.waitForDeployment();
    });
    describe("Basic Functionality", function() {
        it("Should have correct name and symbol", async function() {
            expect(await mockWETH.name()).to.equal("Wrapped Ether");
            expect(await mockWETH.symbol()).to.equal("WETH");
        });
        it("Should have 18 decimals", async function() {
            expect(await mockWETH.decimals()).to.equal(18);
    describe("Deposit and Withdrawal", function() {
        it("Should allow ETH deposits", async function() {
            await mockWETH.connect(user1).deposit({ value: DEPOSIT_AMOUNT });
            expect(await mockWETH.balanceOf(user1.address)).to.equal(DEPOSIT_AMOUNT);
        it("Should emit Deposit event", async function() {
            await expect(mockWETH.connect(user1).deposit({ value: DEPOSIT_AMOUNT }))
                .to.emit(mockWETH, "Deposit")
                .withArgs(user1.address, DEPOSIT_AMOUNT);
        it("Should allow WETH withdrawals", async function() {
            const initialBalance = await ethers.provider.getBalance(user1.address);
            const tx = await mockWETH.connect(user1).withdraw(DEPOSIT_AMOUNT);
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;
            const finalBalance = await ethers.provider.getBalance(user1.address);
            expect(finalBalance + gasUsed - initialBalance).to.equal(DEPOSIT_AMOUNT);
            expect(await mockWETH.balanceOf(user1.address)).to.equal(0);
        it("Should emit Withdrawal event", async function() {
            await expect(mockWETH.connect(user1).withdraw(DEPOSIT_AMOUNT))
                .to.emit(mockWETH, "Withdrawal")
    describe("Transfer Functionality", function() {
        beforeEach(async function() {
        it("Should allow transfers", async function() {
            await mockWETH.connect(user1).transfer(user2.address, DEPOSIT_AMOUNT);
            expect(await mockWETH.balanceOf(user2.address)).to.equal(DEPOSIT_AMOUNT);
        it("Should fail on insufficient balance", async function() {
            const excessAmount = DEPOSIT_AMOUNT + ethers.parseEther("1");
            await expect(
                mockWETH.connect(user1).transfer(user2.address, excessAmount)
            ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    describe("Edge Cases", function() {
        it("Should handle zero deposits", async function() {
                mockWETH.connect(user1).deposit({ value: 0 })
            ).to.not.be.reverted;
        it("Should fail on zero address transfers", async function() {
                mockWETH.connect(user1).transfer(ethers.ZeroAddress, DEPOSIT_AMOUNT)
            ).to.be.revertedWith("ERC20: transfer to the zero address");
        it("Should fail on withdrawing more than balance", async function() {
                mockWETH.connect(user1).withdraw(DEPOSIT_AMOUNT + 1n)
            ).to.be.revertedWith("ERC20: burn amount exceeds balance");
});
