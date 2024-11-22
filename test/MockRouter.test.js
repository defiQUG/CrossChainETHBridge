const { expect } = require("chai");
const { ethers } = require("hardhat");
const { Client } = require("./helpers/Client");

describe("MockRouter Coverage Tests", function() {
  let owner;
  let addr1;
  let addr2;
  let mockRouter;
  const DOM_CHAIN_SELECTOR = 138n;
  const POLYGON_CHAIN_SELECTOR = 137n;

  beforeEach(async function() {
    [owner, addr1, addr2] = await ethers.getSigners();
    const MockRouter = await ethers.getContractFactory("MockRouter");
    mockRouter = await MockRouter.deploy();
    await mockRouter.deployed();
  });

  describe("Chain Support and Token Management", function() {
    it("Should verify supported chains correctly", async function() {
      expect(await mockRouter.isChainSupported(POLYGON_CHAIN_SELECTOR)).to.be.true;
      expect(await mockRouter.isChainSupported(999n)).to.be.false;
    });

    it("Should handle getSupportedTokens for valid chain", async function() {
      const tokens = await mockRouter.getSupportedTokens(POLYGON_CHAIN_SELECTOR);
      expect(tokens.length).to.equal(0);
    });

    it("Should revert getSupportedTokens for invalid chain", async function() {
      await expect(
        mockRouter.getSupportedTokens(999n)
      ).to.be.revertedWith("Unsupported chain");
    });
  });

  describe("Message Reception", function() {
    it("Should handle fee calculations correctly", async function() {
      const message = {
        receiver: ethers.utils.defaultAbiCoder.encode(["address"], [addr2.address]),
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [ethers.utils.parseEther("1.0")]),
        tokenAmounts: [],
        extraArgs: "0x",
        feeToken: ethers.constants.AddressZero
      };

      const fee = await mockRouter.getFee(POLYGON_CHAIN_SELECTOR, message);
      expect(fee).to.equal(ethers.utils.parseEther("0.1"));
    });

    it("Should validate message data correctly", async function() {
      const message = {
        sourceChainSelector: DOM_CHAIN_SELECTOR,
        sender: ethers.utils.hexZeroPad(addr1.address, 32),
        data: ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256"],
          [addr2.address, ethers.utils.parseEther("1.0")]
        ),
        destTokenAmounts: []
      };

      expect(await mockRouter.validateMessage(message)).to.be.true;
    });

    it("Should handle message validation errors", async function() {
      const message = {
        sourceChainSelector: 0n,
        sender: ethers.utils.hexZeroPad(addr1.address, 32),
        data: ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256"],
          [addr2.address, ethers.utils.parseEther("1.0")]
        ),
        destTokenAmounts: []
      };

      await expect(
        mockRouter.validateMessage(message)
      ).to.be.revertedWith("Invalid chain selector");
    });
  });
});
