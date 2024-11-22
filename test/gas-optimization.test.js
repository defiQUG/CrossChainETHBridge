const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Gas Optimization Tests", function() {
  let crossChainMessenger;
  let owner;
  let user;
  let mockRouter;
  let mockWeth;

  beforeEach(async function() {
    [owner, user] = await ethers.getSigners();

    // Deploy MockRouter
    const MockRouter = await ethers.getContractFactory("MockRouter");
    mockRouter = await MockRouter.deploy();
    await mockRouter.deployed();

    // Deploy MockWETH
    const MockWETH = await ethers.getContractFactory("MockWETH");
    mockWeth = await MockWETH.deploy();
    await mockWeth.deployed();

    // Deploy CrossChainMessenger with both router and WETH addresses
    const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
    crossChainMessenger = await CrossChainMessenger.deploy(mockRouter.address, mockWeth.address);
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

      // Fund the contract first
      await owner.sendTransaction({
        to: crossChainMessenger.address,
        value: ethers.utils.parseEther("10.0")
      });

      const messageId = ethers.utils.formatBytes32String("testMessage");
      const sourceChainSelector = 138;
      const sender = owner.address;
      const data = ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [user.address, amount]);
      const message = { messageId, sourceChainSelector, sender, data, destTokenAmounts: [] };

      const tx = await mockRouter.sendMessage(crossChainMessenger.address, message);
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.below(500000, "Gas usage too high for message receiving");
    });
  });
});
