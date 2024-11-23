const { getSigners, parseEther, deployContract } = require("./helpers/ethers-setup");
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
      expect(await mockRouter.isChainSupported(137)).to.be.true; // Polygon PoS
      expect(await mockRouter.isChainSupported(138)).to.be.false; // Defi Oracle Meta
    });

    it("Should handle getSupportedTokens for valid chain", async function () {
      const tokens = await mockRouter.getSupportedTokens(137); // Polygon PoS
      expect(tokens).to.be.an('array').that.is.empty;
    });

    it("Should revert getSupportedTokens for invalid chain", async function () {
      await expect(mockRouter.getSupportedTokens(138)) // Defi Oracle Meta
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
        sender: ethers.utils.hexZeroPad(owner.address, 32),
        data: ethers.utils.defaultAbiCoder.encode(
          ['address', 'uint256'],
          [addr1.address, ethers.utils.parseEther("1.0")]
        ),
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
      const MockReceiver = await ethers.getContractFactory("MockRouter");
      const receiver = await MockReceiver.deploy();
      await receiver.deployed();

      const message = {
        messageId: ethers.utils.hexZeroPad("0x1", 32),
        sourceChainSelector: 138, // From Defi Oracle Meta
        sender: ethers.utils.hexZeroPad(owner.address, 32),
        data: ethers.utils.defaultAbiCoder.encode(
          ['address', 'uint256'],
          [owner.address, ethers.utils.parseEther("1.0")]
        ),
        destTokenAmounts: []
      };

      await mockRouter.ccipReceive(message);
    });

    it("Should handle fee calculations correctly", async function () {
      const { utils } = ethers;
      const message = {
        receiver: utils.defaultAbiCoder.encode(['address'], [addr1.address]),
        data: utils.defaultAbiCoder.encode(['uint256'], [utils.parseEther("1.0")]),
        tokenAmounts: [],
        extraArgs: "0x",
        feeToken: ethers.constants.AddressZero
      };

      const messageFee = await mockRouter.getFee(137, message); // To Polygon PoS
      expect(messageFee).to.equal(utils.parseEther("0.1"));

      await expect(mockRouter.getFee(138, message)) // To Defi Oracle Meta
        .to.be.revertedWith("Unsupported chain");
    });

    it("Should validate message data correctly", async function () {
      const message = {
        messageId: ethers.utils.hexZeroPad("0x1", 32),
        sourceChainSelector: 138, // From Defi Oracle Meta
        sender: ethers.utils.hexZeroPad(owner.address, 32),
        data: ethers.utils.defaultAbiCoder.encode(
          ['address', 'uint256'],
          [ethers.constants.AddressZero, ethers.utils.parseEther("1.0")]
        ),
        destTokenAmounts: []
      };
      await expect(mockRouter.validateMessage(message))
        .to.be.revertedWith("Invalid recipient");
    });

    it("Should handle message validation errors", async function () {
      const message = {
        messageId: ethers.utils.hexZeroPad("0x1", 32),
        sourceChainSelector: 0,
        sender: ethers.utils.hexZeroPad(owner.address, 32),
        data: ethers.utils.defaultAbiCoder.encode(
          ['address', 'uint256'],
          [owner.address, ethers.utils.parseEther("1.0")]
        ),
        destTokenAmounts: []
      };
      await expect(mockRouter.validateMessage(message))
        .to.be.revertedWith("Invalid chain selector");
    });
  });
});
