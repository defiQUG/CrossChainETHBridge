const { expect } = require("chai");
const { ethers } = require("hardhat");
const { Client } = require("./helpers/Client");

describe("MockRouter Coverage Tests", function() {
  let owner;
  let addr1;
  let addr2;
  let mockRouter;
  const DOM_CHAIN_SELECTOR = 138;
  const POLYGON_CHAIN_SELECTOR = 137;

  beforeEach(async function() {
    [owner, addr1, addr2] = await ethers.getSigners();
    const MockRouter = await ethers.getContractFactory("MockRouter");
    mockRouter = await MockRouter.deploy();
    await mockRouter.deployed();
  });

  describe("Chain Support and Token Management", function() {
    it("Should verify supported chains correctly", async function() {
      expect(await mockRouter.isChainSupported(POLYGON_CHAIN_SELECTOR)).to.be.true;
      expect(await mockRouter.isChainSupported(999)).to.be.false;
    });

    it("Should handle getSupportedTokens for valid chain", async function() {
      const tokens = await mockRouter.getSupportedTokens(POLYGON_CHAIN_SELECTOR);
      expect(tokens.length).to.equal(0);
    });

    it("Should revert getSupportedTokens for invalid chain", async function() {
      await expect(
        mockRouter.getSupportedTokens(999)
      ).to.be.revertedWith("Chain not supported");
    });
  });

  describe("Message Reception", function() {
    it("Should handle fee calculations correctly", async function() {
      const message = {
        messageId: ethers.utils.id("testMessage"),
        sourceChainSelector: DOM_CHAIN_SELECTOR,
        sender: addr1.address,
        data: ethers.utils.defaultAbiCoder.encode(["address"], [addr2.address]),
        destTokenAmounts: []
      };

      const fee = ethers.utils.parseEther("0.1");
      await mockRouter.setFee(fee);

      const calculatedFee = await mockRouter.getFee(message);
      expect(calculatedFee).to.equal(fee);

      const tx = await mockRouter.ccipReceive(message);
      await expect(tx).to.emit(mockRouter, "MessageReceived")
        .withArgs(message.messageId, message.sourceChainSelector);
    });

    it("Should validate message data correctly", async function() {
      const message = {
        messageId: ethers.utils.id("testMessage"),
        sourceChainSelector: DOM_CHAIN_SELECTOR,
        sender: addr1.address,
        data: ethers.utils.defaultAbiCoder.encode(["address"], [addr2.address]),
        destTokenAmounts: []
      };

      await expect(mockRouter.ccipReceive(message))
        .to.emit(mockRouter, "MessageReceived")
        .withArgs(message.messageId, message.sourceChainSelector);
    });

    it("Should handle message validation errors", async function() {
      const invalidMessage = {
        messageId: ethers.utils.id("testMessage"),
        sourceChainSelector: 999,
        sender: addr1.address,
        data: ethers.utils.defaultAbiCoder.encode(["address"], [addr2.address]),
        destTokenAmounts: []
      };

      await expect(
        mockRouter.ccipReceive(invalidMessage)
      ).to.be.revertedWith("Invalid source chain");
    });
  });
});
