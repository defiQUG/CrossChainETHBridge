const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrossChainMessenger", function() {
  let crossChainMessenger;
  let mockRouter;
  let owner;
  let user;
  const POLYGON_CHAIN_SELECTOR = 137;

  beforeEach(async function() {
    [owner, user] = await ethers.getSigners();

    const MockRouter = await ethers.getContractFactory("MockRouter");
    mockRouter = await MockRouter.deploy();
    await mockRouter.deployed();

    const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
    crossChainMessenger = await CrossChainMessenger.deploy(mockRouter.address);
    await crossChainMessenger.deployed();
  });

  describe("Basic Functionality", function() {
    it("Should initialize with correct router address", async function() {
      expect(await crossChainMessenger.getRouter()).to.equal(mockRouter.address);
    });

    it("Should set correct bridge fee", async function() {
      const fee = await crossChainMessenger.getBridgeFee();
      expect(fee).to.equal(ethers.utils.parseEther("0.1"));
    });
  });

  describe("Message Sending", function() {
    it("Should send message to Polygon", async function() {
      const amount = ethers.utils.parseEther("1");
      await expect(crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount }))
        .to.emit(mockRouter, "MessageSent")
        .withArgs(
          ethers.constants.HashZero,
          POLYGON_CHAIN_SELECTOR,
          user.address,
          ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [user.address, amount]),
          ethers.constants.AddressZero,
          amount
        );
    });
  });

  describe("Security Features", function() {
    it("Should pause and unpause", async function() {
      await crossChainMessenger.pause();
      expect(await crossChainMessenger.paused()).to.be.true;
      await crossChainMessenger.unpause();
      expect(await crossChainMessenger.paused()).to.be.false;
    });

    it("Should prevent sending when paused", async function() {
      await crossChainMessenger.pause();
      const amount = ethers.utils.parseEther("1");
      await expect(
        crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount })
      ).to.be.revertedWith("Pausable: paused");
    });
  });
});
