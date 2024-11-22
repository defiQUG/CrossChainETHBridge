const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MockRouter", function () {
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

  describe("Fee Management", function () {
    it("Should return correct fee", async function () {
      const message = {
        receiver: ethers.utils.defaultAbiCoder.encode(["address"], [addr1.address]),
        data: "0x",
        tokenAmounts: [],
        extraArgs: "0x",
        feeToken: ethers.constants.AddressZero
      };

      const fee = await mockRouter.getFee(137, message);
      expect(fee).to.equal(ethers.utils.parseEther("0.001"));
    });

    it("Should revert getFee with invalid chain selector", async function () {
      const message = {
        receiver: ethers.utils.defaultAbiCoder.encode(["address"], [addr1.address]),
        data: "0x",
        tokenAmounts: [],
        extraArgs: "0x",
        feeToken: ethers.constants.AddressZero
      };

      await expect(mockRouter.getFee(0, message))
        .to.be.revertedWith("Invalid chain selector");
    });

    it("Should revert getFee with invalid receiver", async function () {
      const message = {
        receiver: "0x",
        data: "0x",
        tokenAmounts: [],
        extraArgs: "0x",
        feeToken: ethers.constants.AddressZero
      };

      await expect(mockRouter.getFee(137, message))
        .to.be.revertedWith("Invalid receiver");
    });
  });

  describe("Chain Support", function () {
    it("Should support Polygon chain", async function () {
      expect(await mockRouter.isChainSupported(137)).to.be.true;
    });

    it("Should support Defi Oracle Meta chain", async function () {
      expect(await mockRouter.isChainSupported(138)).to.be.true;
    });

    it("Should not support other chains", async function () {
      expect(await mockRouter.isChainSupported(1)).to.be.false;
    });
  });

  describe("Supported Tokens", function () {
    it("Should return empty array for supported chains", async function () {
      const tokens = await mockRouter.getSupportedTokens(137);
      expect(tokens).to.be.an("array").that.is.empty;
    });

    it("Should revert for unsupported chains", async function () {
      await expect(mockRouter.getSupportedTokens(1))
        .to.be.revertedWith("Unsupported chain");
    });
  });

  describe("Message Handling", function () {
    it("Should emit MessageSent event on ccipSend", async function () {
      const encodedAddress = "0x" + addr1.address.slice(2).padStart(40, "0");
      const message = {
        receiver: encodedAddress,
        data: "0x",
        tokenAmounts: [],
        extraArgs: "0x",
        feeToken: ethers.constants.AddressZero
      };

      // Calculate message ID using the same method as the contract
      const messageId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["uint64", "bytes", "bytes"],
          [137, encodedAddress, message.data]
        )
      );
      await mockRouter.setNextMessageId(messageId);

      await expect(mockRouter.ccipSend(137, message, { value: ethers.utils.parseEther("0.001") }))
        .to.emit(mockRouter, "MessageSent")
        .withArgs(messageId, 137, addr1.address, "0x", ethers.constants.AddressZero, ethers.utils.parseEther("0.001"));
    });

    it("Should handle empty message data correctly", async function () {
      const message = {
        receiver: addr1.address,
        data: "0x",
        tokenAmounts: [],
        extraArgs: "0x",
        feeToken: ethers.constants.AddressZero
      };

      const messageId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["uint64", "bytes", "bytes"],
          [137, message.receiver, message.data]
        )
      );
      await mockRouter.setNextMessageId(messageId);

      await expect(mockRouter.ccipSend(137, message, { value: ethers.utils.parseEther("0.001") }))
        .to.emit(mockRouter, "MessageSent")
        .withArgs(messageId, 137, addr1.address, "0x", ethers.constants.AddressZero, ethers.utils.parseEther("0.001"));
    });

    it("Should handle message with non-empty data", async function () {
      const testData = ethers.utils.defaultAbiCoder.encode(["string"], ["test message"]);
      const message = {
        receiver: addr1.address,
        data: testData,
        tokenAmounts: [],
        extraArgs: "0x",
        feeToken: ethers.constants.AddressZero
      };

      const messageId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["uint64", "bytes", "bytes"],
          [137, message.receiver, testData]
        )
      );
      await mockRouter.setNextMessageId(messageId);

      await expect(mockRouter.ccipSend(137, message, { value: ethers.utils.parseEther("0.001") }))
        .to.emit(mockRouter, "MessageSent")
        .withArgs(messageId, 137, addr1.address, testData, ethers.constants.AddressZero, ethers.utils.parseEther("0.001"));
    });
  });
});
