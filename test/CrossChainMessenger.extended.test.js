const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrossChainMessenger Extended Tests", function() {
  let messenger, router, weth, owner, user;
  const mockMessageId = "0x1234567890123456789012345678901234567890123456789012345678901234";

  beforeEach(async function() {
    [owner, user] = await ethers.getSigners();

    const MockRouter = await ethers.getContractFactory("MockRouter");
    router = await MockRouter.deploy();
    await router.deployed();

    const MockWETH = await ethers.getContractFactory("MockWETH");
    weth = await MockWETH.deploy();
    await weth.deployed();

    const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
    messenger = await CrossChainMessenger.deploy(router.address, weth.address);
    await messenger.deployed();
  });

  describe("Fee Management", function() {
    it("Should update bridge fee correctly", async function() {
      const newFee = ethers.utils.parseEther("0.01");
      await messenger.setBridgeFee(newFee);
      expect(await messenger.bridgeFee()).to.equal(newFee);
    });

    it("Should revert fee update from non-owner", async function() {
      const newFee = ethers.utils.parseEther("0.01");
      await expect(
        messenger.connect(user).setBridgeFee(newFee)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Message Processing", function() {
    it("Should process received messages correctly", async function() {
      const amount = ethers.utils.parseEther("1.0");
      await messenger.processMessage(user.address, amount, mockMessageId);
      // Add verification of message processing
    });

    it("Should handle zero amount messages", async function() {
      await expect(
        messenger.processMessage(user.address, 0, mockMessageId)
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("Emergency Controls", function() {
    it("Should not process messages when paused", async function() {
      await messenger.pause();
      const amount = ethers.utils.parseEther("1.0");
      await expect(
        messenger.processMessage(user.address, amount, mockMessageId)
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should resume processing after unpause", async function() {
      await messenger.pause();
      await messenger.unpause();
      const amount = ethers.utils.parseEther("1.0");
      await messenger.processMessage(user.address, amount, mockMessageId);
      // Add verification of message processing
    });
  });
});
