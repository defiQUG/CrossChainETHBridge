const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Gas Optimization Tests", function() {
  let crossChainMessenger;
  let owner;
  let user;
  let mockRouter;

  beforeEach(async function() {
    [owner, user] = await ethers.getSigners();
    const MockRouter = await ethers.getContractFactory("MockRouter");
    mockRouter = await MockRouter.deploy();
    await mockRouter.deployed();
    const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
    crossChainMessenger = await CrossChainMessenger.deploy(mockRouter.address);
    await crossChainMessenger.deployed();
  });

  describe("Gas Usage Analysis", function() {
    it("Should optimize gas for message sending", async function() {
      const amount = ethers.utils.parseEther("1");
      const tx = await crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount });
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.below(300000, "Gas usage too high for message sending");
    });

    it("Should optimize gas for message receiving", async function() {
      const amount = ethers.utils.parseEther("1");
      const messageId = ethers.utils.formatBytes32String("testMessage");
      const sourceChainSelector = 138;
      const sender = owner.address;
      const data = ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [user.address, amount]);
      const message = { messageId, sourceChainSelector, sender, data, destTokenAmounts: [] };
      await mockRouter.sendMessage(crossChainMessenger.address, message);
      const receipt = await ethers.provider.getTransactionReceipt(mockRouter.deployTransaction.hash);
      expect(receipt.gasUsed).to.be.below(500000, "Gas usage too high for message receiving");
    });
  });
});