const { expect } = require("chai");
const { ethers } = require("hardhat");
const { Client } = require("./helpers/Client");

describe("MockRouter Coverage Tests", function () {
  let mockRouter;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const MockRouter = await ethers.getContractFactory("MockRouter");
    mockRouter = await MockRouter.deploy();
    await mockRouter.deployed();
  });

  describe("Chain Support and Token Management", function () {
    it("Should verify supported chains correctly", async function () {
      expect(await mockRouter.isChainSupported(137)).to.be.true;
      expect(await mockRouter.isChainSupported(138)).to.be.false;
    });

    it("Should handle getSupportedTokens for valid chain", async function () {
      const tokens = await mockRouter.getSupportedTokens(137);
      expect(tokens).to.be.an('array').that.is.empty;
    });

    it("Should revert getSupportedTokens for invalid chain", async function () {
      await expect(mockRouter.getSupportedTokens(138))
        .to.be.revertedWith("Unsupported chain");
    });
  });

  describe("Message Simulation", function () {
    it("Should handle message simulation correctly", async function () {
      const MockReceiver = await ethers.getContractFactory("MockRouter");
      const receiver = await MockReceiver.deploy();
      await receiver.deployed();

      const message = {
        messageId: ethers.utils.hexZeroPad("0x1", 32),
        sourceChainSelector: 138,
        sender: owner.address,
        data: "0x",
        destTokenAmounts: []
      };

      await mockRouter.simulateMessageReceived(receiver.address, message);
    });

    it("Should revert simulation with invalid source chain", async function () {
      const message = {
        messageId: ethers.utils.hexZeroPad("0x1", 32),
        sourceChainSelector: 137,
        sender: owner.address,
        data: "0x",
        destTokenAmounts: []
      };

      await expect(mockRouter.simulateMessageReceived(addr1.address, message))
        .to.be.revertedWith("Invalid source chain");
    });

    it("Should revert simulation with zero address target", async function () {
      const message = {
        messageId: ethers.utils.hexZeroPad("0x1", 32),
        sourceChainSelector: 138,
        sender: owner.address,
        data: "0x",
        destTokenAmounts: []
      };

      await expect(mockRouter.simulateMessageReceived(ethers.constants.AddressZero, message))
        .to.be.revertedWith("Invalid target address");
    });
  });

  describe("Message Reception", function () {
    it("Should handle ccipReceive correctly", async function () {
      const message = {
        messageId: ethers.utils.hexZeroPad("0x1", 32),
        sourceChainSelector: 138,
        sender: owner.address,
        data: "0x",
        destTokenAmounts: []
      };

      await mockRouter.ccipReceive(message);
    });
  });
});
