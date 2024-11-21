const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrossChainMessenger", function () {
  let CrossChainMessenger;
  let messenger;
  let owner;
  let addr1;
  let addr2;
  let mockRouter;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy mock router contract for testing
    const MockRouter = await ethers.getContractFactory("MockRouter");
    mockRouter = await MockRouter.deploy();
    await mockRouter.deployed();

    // Deploy the messenger contract
    CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
    messenger = await CrossChainMessenger.deploy(mockRouter.address);
    await messenger.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await messenger.owner()).to.equal(owner.address);
    });

    it("Should have correct chain selectors", async function () {
      expect(await messenger.DEFI_ORACLE_META_SELECTOR()).to.equal(138);
      expect(await messenger.POLYGON_SELECTOR()).to.equal(137);
    });
  });

  describe("ETH Bridging", function () {
    const receiverAddress = addr1.address;
    const sendAmount = ethers.utils.parseEther("1.0");
    const mockFee = ethers.utils.parseEther("0.1");

    beforeEach(async function () {
      // Mock the router's getFee function to return our mock fee
      await mockRouter.setFee(mockFee);
    });

    it("Should send ETH to Polygon successfully", async function () {
      const tx = await messenger.sendToPolygon(receiverAddress, {
        value: sendAmount
      });

      await expect(tx)
        .to.emit(messenger, "MessageSent")
        .withArgs(
          ethers.BigNumber.from(0), // messageId from mock
          owner.address,
          sendAmount.sub(mockFee)
        );
    });

    it("Should fail when sending with insufficient ETH", async function () {
      const insufficientAmount = mockFee.div(2);
      await expect(
        messenger.sendToPolygon(receiverAddress, {
          value: insufficientAmount
        })
      ).to.be.revertedWith("Insufficient ETH for fees");
    });

    it("Should handle CCIP message receipt correctly", async function () {
      const messageId = ethers.utils.id("testMessage");
      const sourceChain = 138; // DEFI_ORACLE_META_SELECTOR
      const amount = ethers.utils.parseEther("0.5");

      const message = {
        messageId,
        sourceChainSelector: sourceChain,
        sender: mockRouter.address,
        data: ethers.utils.defaultAbiCoder.encode(["address"], [receiverAddress]),
        destTokenAmounts: [{
          amount: amount
        }]
      };

      await expect(messenger.connect(mockRouter)._ccipReceive(message))
        .to.emit(messenger, "MessageReceived")
        .withArgs(messageId, receiverAddress, amount);
    });

    it("Should reject messages from invalid source chain", async function () {
      const messageId = ethers.utils.id("testMessage");
      const invalidSourceChain = 1; // Invalid chain selector

      const message = {
        messageId,
        sourceChainSelector: invalidSourceChain,
        sender: mockRouter.address,
        data: ethers.utils.defaultAbiCoder.encode(["address"], [receiverAddress]),
        destTokenAmounts: []
      };

      await expect(
        messenger.connect(mockRouter)._ccipReceive(message)
      ).to.be.revertedWith("Message from invalid chain");
    });
  });

  describe("Security", function () {
    it("Should only allow router to call _ccipReceive", async function () {
      const message = {
        messageId: ethers.utils.id("testMessage"),
        sourceChainSelector: 138,
        sender: addr1.address,
        data: ethers.utils.defaultAbiCoder.encode(["address"], [addr2.address]),
        destTokenAmounts: []
      };

      await expect(
        messenger.connect(addr1)._ccipReceive(message)
      ).to.be.revertedWith("Caller is not the router");
    });

    it("Should allow contract to receive ETH", async function () {
      const amount = ethers.utils.parseEther("1.0");
      await owner.sendTransaction({
        to: messenger.address,
        value: amount
      });

      const balance = await ethers.provider.getBalance(messenger.address);
      expect(balance).to.equal(amount);
    });
  });
});
