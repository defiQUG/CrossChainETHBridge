const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TestRouter", function () {
  let testRouter;
  let owner;
  let addr1;
  let addr2;
  let mockToken;
  let oracle;
  const maxMessages = 100;
  const periodDuration = 3600; // 1 hour

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy mock ERC20 token for fees
    const MockToken = await ethers.getContractFactory("MockToken");
    mockToken = await MockToken.deploy("Mock Token", "MTK");
    await mockToken.waitForDeployment();

    // Deploy DefiOracle
    const DefiOracle = await ethers.getContractFactory("DefiOracle");
    oracle = await DefiOracle.deploy();
    await oracle.waitForDeployment();

    const TestRouter = await ethers.getContractFactory("TestRouter");
    testRouter = await TestRouter.deploy(maxMessages, periodDuration);
    await testRouter.waitForDeployment();

    // Initialize router with proper values
    const baseFee = ethers.parseEther("1.1"); // 1.1 ETH base fee
    await testRouter.initialize(
      owner.address,
      await mockToken.getAddress(),
      baseFee,
      await oracle.getAddress()
    );
  });

  describe("Gas Fee Calculations", function () {
    it("should return correct base fee for supported chains", async function () {
      const message = {
        receiver: addr1.address,
        data: "0x",
        tokenAmounts: [],
        feeToken: ethers.ZeroAddress,
        extraArgs: "0x"
      };

      const feeDefiOracle = await testRouter.getFee(138, message);
      const feePolygon = await testRouter.getFee(137, message);

      expect(feeDefiOracle).to.be.gt(feePolygon);
      expect(feeDefiOracle).to.be.gt(0);
      expect(feePolygon).to.be.gt(0);
    });

    it("should increase fee for larger messages", async function () {
      const smallMessage = {
        receiver: addr1.address,
        data: "0x",
        tokenAmounts: [],
        feeToken: ethers.ZeroAddress,
        extraArgs: "0x"
      };

      const largeMessage = {
        receiver: addr1.address,
        data: "0x" + "ff".repeat(1000), // 1000 bytes of data
        tokenAmounts: [],
        feeToken: ethers.ZeroAddress,
        extraArgs: "0x"
      };

      const feeSmall = await testRouter.getFee(138, smallMessage);
      const feeLarge = await testRouter.getFee(138, largeMessage);

      expect(feeLarge).to.be.gt(feeSmall);
    });

    it("should revert for unsupported chains", async function () {
      const message = {
        receiver: addr1.address,
        data: "0x",
        tokenAmounts: [],
        feeToken: ethers.ZeroAddress,
        extraArgs: "0x"
      };

      await expect(
        testRouter.getFee(999, message)
      ).to.be.revertedWith("Chain not supported");
    });
  });

  describe("Message Validation", function () {
    it("should validate correct messages", async function () {
      const message = {
        messageId: "0x1234567890123456789012345678901234567890123456789012345678901234",
        sourceChainSelector: 138,
        sender: "0x1234567890123456789012345678901234567890",
        data: "0x1234",
        destTokenAmounts: []
      };

      expect(await testRouter.validateMessage(message)).to.be.true;
    });

    it("should revert for invalid messages", async function () {
      const invalidMessage = {
        messageId: ethers.ZeroHash,
        sourceChainSelector: 138,
        sender: "0x1234567890123456789012345678901234567890",
        data: "0x1234",
        destTokenAmounts: []
      };

      await expect(
        testRouter.validateMessage(invalidMessage)
      ).to.be.revertedWith("TestRouter: invalid message");
    });
  });
});
