const { ethers } = require('hardhat'); const { expect } = require('chai'); const { deployTestContracts, TEST_CONFIG } = require('./helpers/setup'); const { deployContract, getContractAt } = require('./helpers/test-utils');

const { ZeroAddress } = ethers;
describe("Coverage Improvement Tests", function () {
  let messenger, router, weth, owner, user1, user2;
  const RATE_PERIOD = 3600; // 1 hour in seconds
  const MAX_MESSAGES = 5;
  let INITIAL_BALANCE;
  beforeEach(async function () {
    [owner, user1, user2] = await getSigners();
    INITIAL_BALANCE = await parseEther("10.0");
    router = await deployContract("MockRouter");
    weth = await deployContract("MockWETH", "Wrapped Ether", "WETH");
    messenger = await deployContract("CrossChainMessenger", [
      await router.getAddress(),
      await weth.getAddress(),
      MAX_MESSAGES
    ]);
    // Fund the contract
    await owner.sendTransaction({
      to: await messenger.getAddress(),
      value: INITIAL_BALANCE
    });
  });
  describe("MockWETH", function () {
    it("Should handle deposit and withdrawal correctly", async function () {
      const depositAmount = parseEther("1.0");
      await weth.deposit({ value: depositAmount });
      expect(await weth.balanceOf(owner.address)).to.equal(depositAmount);
      await weth.withdraw(depositAmount);
      expect(await weth.balanceOf(owner.address)).to.equal(0);
    it("Should handle transfer correctly", async function () {
      const amount = parseEther("1.0");
      await weth.deposit({ value: amount });
      await weth.transfer(user1.address, amount);
      expect(await weth.balanceOf(user1.address)).to.equal(amount);
  describe("RateLimiter Edge Cases", function () {
    it("Should handle multiple messages within same period", async function () {
      const messageValue = await parseEther("1.0");
      for (let i = 0; i < MAX_MESSAGES; i++) {
        await messenger.sendToPolygon(user1.address, { value: messageValue });
      }
      await expect(
        messenger.sendToPolygon(user1.address, { value: messageValue })
      ).to.be.revertedWith("Rate limit exceeded for current period");
  describe("Emergency Controls", function () {
    it("Should handle emergency withdraw correctly", async function () {
      await messenger.emergencyPause();
      const initialBalance = await ethers.provider.getBalance(user2.address);
      await messenger.emergencyWithdraw(user2.address);
      const finalBalance = await ethers.provider.getBalance(user2.address);
      expect(finalBalance - initialBalance).to.equal(INITIAL_BALANCE);
    it("Should prevent emergency withdraw when not paused", async function () {
      // Make sure contract is not paused
      if (await messenger.paused()) {
        await messenger.emergencyUnpause();
        messenger.emergencyWithdraw(user2.address)
      ).to.be.revertedWith("Pausable: not paused");
    it("Should prevent emergency withdraw to zero address", async function () {
        messenger.emergencyWithdraw(ZeroAddress)
      ).to.be.revertedWith("CrossChainMessenger: zero recipient address");
  describe("MockRouter", function () {
    it("Should handle ccipSend correctly", async function () {
      const amount = await parseEther("1.0");
      await messenger.sendToPolygon(user1.address, { value: amount });
      const events = await router.queryFilter(router.filters.MessageSent());
      expect(events.length).to.be.above(0);
    it("Should emit correct events on message send", async function () {
      await expect(messenger.sendToPolygon(user1.address, { value: amount }))
        .to.emit(router, "MessageSent");
});
