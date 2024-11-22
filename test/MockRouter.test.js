const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MockRouter", function () {
  let mockRouter;
  let owner;
  let addr1;
  let addr2;
  let mockReceiver;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy MockRouter
    const MockRouter = await ethers.getContractFactory("MockRouter");
    mockRouter = await MockRouter.deploy();
    await mockRouter.deployed();

    // Deploy a mock receiver contract for testing
    const MockReceiver = await ethers.getContractFactory("CrossChainMessenger");
    mockReceiver = await MockReceiver.deploy(mockRouter.address, ethers.constants.AddressZero);
    await mockReceiver.deployed();
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
      const message = {
        receiver: mockReceiver.address,
        data: ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256"],
          [mockReceiver.address, ethers.utils.parseEther("1.0")]
        ),
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

      await expect(mockRouter.ccipSend(137, message, { value: ethers.utils.parseEther("1.001") }))
        .to.emit(mockRouter, "MessageSent")
        .withArgs(
          messageId,
          137,
          mockReceiver.address,
          message.data,
          ethers.constants.AddressZero,
          ethers.utils.parseEther("1.001")
        );
    });

    it("Should handle empty message data correctly", async function () {
      const message = {
        receiver: mockReceiver.address,
        data: ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256"],
          [mockReceiver.address, ethers.utils.parseEther("0")]
        ),
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
        .withArgs(
          messageId,
          137,
          mockReceiver.address,
          message.data,
          ethers.constants.AddressZero,
          ethers.utils.parseEther("0.001")
        );
    });

    it("Should handle message with non-empty data", async function () {
      const testData = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256"],
        [mockReceiver.address, ethers.utils.parseEther("1.0")]
      );

      const message = {
        receiver: mockReceiver.address,
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

      await expect(mockRouter.ccipSend(137, message, { value: ethers.utils.parseEther("1.001") }))
        .to.emit(mockRouter, "MessageSent")
        .withArgs(
          messageId,
          137,
          mockReceiver.address,
          testData,
          ethers.constants.AddressZero,
          ethers.utils.parseEther("1.001")
        );
    });
  });
});
