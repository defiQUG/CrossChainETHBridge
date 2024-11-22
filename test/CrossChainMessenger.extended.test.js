const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrossChainMessenger Extended Tests", function() {
  let messenger, router, weth, owner, user;
  const mockMessageId = "0x1234567890123456789012345678901234567890123456789012345678901234";

  beforeEach(async function() {
    [owner, user] = await ethers.getSigners();

    // Deploy MockRouter first
    const MockRouter = await ethers.getContractFactory("MockRouter");
    router = await MockRouter.deploy();
    await router.deployed();

    // Deploy MockWETH
    const MockWETH = await ethers.getContractFactory("MockWETH");
    weth = await MockWETH.deploy();
    await weth.deployed();

    // Deploy CrossChainMessenger with router and WETH addresses
    const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
    messenger = await CrossChainMessenger.deploy(router.address, weth.address);
    await messenger.deployed();

    // Fund contracts for testing
    await owner.sendTransaction({
      to: messenger.address,
      value: ethers.utils.parseEther("10.0")
    });
    await owner.sendTransaction({
      to: weth.address,
      value: ethers.utils.parseEther("10.0")
    });
  });

  describe("Fee Management", function() {
    it("Should update bridge fee correctly", async function() {
      const newFee = ethers.utils.parseEther("0.01");
      await messenger.updateBridgeFee(newFee);
      expect(await messenger.getBridgeFee()).to.equal(newFee);
    });

    it("Should revert fee update from non-owner", async function() {
      const newFee = ethers.utils.parseEther("0.01");
      await expect(
        messenger.connect(user).updateBridgeFee(newFee)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Message Processing", function() {
    const testAmount = ethers.utils.parseEther("1.0");

    beforeEach(async function() {
      // Fund user for testing
      await owner.sendTransaction({
        to: user.address,
        value: ethers.utils.parseEther("5.0")
      });
    });

    it("Should process received messages correctly", async function() {
      const balanceBefore = await ethers.provider.getBalance(user.address);

      await router.simulateMessageReceived(
        messenger.address,
        mockMessageId,
        user.address,
        testAmount
      );

      const balanceAfter = await ethers.provider.getBalance(user.address);
      expect(balanceAfter.sub(balanceBefore)).to.equal(testAmount);
    });

    it("Should handle zero amount messages", async function() {
      await expect(
        router.simulateMessageReceived(
          messenger.address,
          mockMessageId,
          user.address,
          0
        )
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should emit MessageReceived event", async function() {
      const amount = ethers.utils.parseEther("1.0");
      await expect(
        router.simulateMessageReceived(
          messenger.address,
          mockMessageId,
          user.address,
          amount
        )
      ).to.emit(messenger, "MessageReceived")
        .withArgs(mockMessageId, router.address, user.address, amount);
    });
  });

  describe("Emergency Controls", function() {
    it("Should not process messages when paused", async function() {
      await messenger.pause();
      const amount = ethers.utils.parseEther("1.0");
      await expect(
        router.simulateMessageReceived(
          messenger.address,
          mockMessageId,
          user.address,
          amount
        )
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should resume processing after unpause", async function() {
      await messenger.pause();
      await messenger.unpause();
      const amount = ethers.utils.parseEther("1.0");
      const balanceBefore = await ethers.provider.getBalance(user.address);

      await router.simulateMessageReceived(
        messenger.address,
        mockMessageId,
        user.address,
        amount
      );

      const balanceAfter = await ethers.provider.getBalance(user.address);
      expect(balanceAfter.sub(balanceBefore)).to.equal(amount);
    });
  });
});
