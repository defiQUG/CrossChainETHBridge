const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrossChainMessenger", function() {
  let crossChainMessenger;
  let owner;
  let user;
  let mockRouter;
  let mockWETH;

  beforeEach(async function() {
    [owner, user] = await ethers.getSigners();
    const MockRouter = await ethers.getContractFactory("MockRouter");
    mockRouter = await MockRouter.deploy();
    await mockRouter.deployed();
    const MockWETH = await ethers.getContractFactory("MockWETH");
    mockWETH = await MockWETH.deploy();
    await mockWETH.deployed();
    const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
    crossChainMessenger = await CrossChainMessenger.deploy(mockRouter.address);
    await crossChainMessenger.deployed();
  });

  describe("Basic Functionality", function() {
    it("Should initialize with correct router address", async function() {
      expect(await crossChainMessenger.i_router()).to.equal(mockRouter.address);
    });
    it("Should set correct bridge fee", async function() {
      expect(await crossChainMessenger.bridgeFee()).to.equal(ethers.utils.parseEther("0.001"));
    });
  });

  describe("Message Sending", function() {
    it("Should send message to Polygon", async function() {
      const amount = ethers.utils.parseEther("1");
      await expect(crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount }))
        .to.emit(crossChainMessenger, "MessageSent")
        .withArgs(ethers.constants.HashZero, user.address, amount.sub(ethers.utils.parseEther("0.001")), ethers.utils.parseEther("0.001"));
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
      await expect(crossChainMessenger.sendToPolygon(user.address, { value: ethers.utils.parseEther("1") })).to.be.revertedWith("Pausable: paused");
    });
  });
});
