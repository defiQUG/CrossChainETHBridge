const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrossChainMessenger", function () {
  let CrossChainMessenger;
  let messenger;
  let owner;
  let addr1;
  let addr2;
  let mockRouter;
  const destinationChainSelector = "12532609583862916517"; // Example chain selector
  const mockReceiver = "0x1234567890123456789012345678901234567890";

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

    it("Should set the correct router address", async function () {
      expect(await messenger.getRouter()).to.equal(mockRouter.address);
    });
  });

  describe("Cross-chain messaging", function () {
    const message = ethers.utils.defaultAbiCoder.encode(["string"], ["Hello, Cross-chain!"]);
    const fee = ethers.utils.parseEther("0.1");

    beforeEach(async function () {
      // Fund the contract for message fees
      await owner.sendTransaction({
        to: messenger.address,
        value: ethers.utils.parseEther("1.0")
      });
    });

    it("Should send cross-chain message successfully", async function () {
      const tx = await messenger.sendMessage(
        destinationChainSelector,
        mockReceiver,
        message,
        { value: fee }
      );

      await expect(tx)
        .to.emit(messenger, "MessageSent")
        .withArgs(destinationChainSelector, mockReceiver, message);
    });

    it("Should fail when sending message with insufficient fee", async function () {
      const insufficientFee = ethers.utils.parseEther("0.01");
      await expect(
        messenger.sendMessage(
          destinationChainSelector,
          mockReceiver,
          message,
          { value: insufficientFee }
        )
      ).to.be.revertedWith("Insufficient fee");
    });

    it("Should handle message receipt correctly", async function () {
      const messageId = ethers.utils.id("testMessage");
      const sender = addr1.address;

      await expect(
        messenger.connect(mockRouter).ccipReceive({
          messageId,
          sender,
          data: message
        })
      )
        .to.emit(messenger, "MessageReceived")
        .withArgs(messageId, sender, message);
    });
  });

  describe("Security and Access Control", function () {
    it("Should only allow router to call ccipReceive", async function () {
      const messageId = ethers.utils.id("testMessage");
      const sender = addr1.address;

      await expect(
        messenger.connect(addr1).ccipReceive({
          messageId,
          sender,
          data: ethers.utils.defaultAbiCoder.encode(["string"], ["Test"])
        })
      ).to.be.revertedWith("Only router can call");
    });

    it("Should allow owner to withdraw funds", async function () {
      const amount = ethers.utils.parseEther("1.0");
      await owner.sendTransaction({
        to: messenger.address,
        value: amount
      });

      const initialBalance = await ethers.provider.getBalance(owner.address);
      await messenger.connect(owner).withdraw();
      const finalBalance = await ethers.provider.getBalance(owner.address);

      expect(finalBalance.sub(initialBalance)).to.be.gt(0);
    });

    it("Should not allow non-owner to withdraw funds", async function () {
      await expect(
        messenger.connect(addr1).withdraw()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
