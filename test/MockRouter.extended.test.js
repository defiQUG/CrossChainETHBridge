const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MockRouter Extended Tests", function () {
  let router, owner, user1, user2;
  const POLYGON_CHAIN_ID = 137;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const MockRouter = await ethers.getContractFactory("MockRouter");
    router = await MockRouter.deploy();
    await router.deployed();
  });

  describe("Message Handling", function () {
    it("Should handle ccipSend with correct parameters", async function () {
      const message = ethers.utils.defaultAbiCoder.encode(
        ["bytes32", "address", "address", "uint256"],
        [ethers.utils.id("testMessage"), user1.address, user2.address, ethers.utils.parseEther("1.0")]
      );

      await expect(router.ccipSend(POLYGON_CHAIN_ID, message))
        .to.emit(router, "MessageSent")
        .withArgs(POLYGON_CHAIN_ID, message);
    });

    it("Should handle multiple messages correctly", async function () {
      for (let i = 0; i < 3; i++) {
        const message = ethers.utils.defaultAbiCoder.encode(
          ["bytes32", "address", "address", "uint256"],
          [ethers.utils.id(`message${i}`), user1.address, user2.address, ethers.utils.parseEther("1.0")]
        );
        await router.ccipSend(POLYGON_CHAIN_ID, message);
      }

      const events = await router.queryFilter(router.filters.MessageSent());
      expect(events.length).to.equal(3);
    });

    it("Should handle messages with different chain IDs", async function () {
      const chainIds = [137, 138, 1];
      for (const chainId of chainIds) {
        const message = ethers.utils.defaultAbiCoder.encode(
          ["bytes32", "address", "address", "uint256"],
          [ethers.utils.id("testMessage"), user1.address, user2.address, ethers.utils.parseEther("1.0")]
        );
        await expect(router.ccipSend(chainId, message))
          .to.emit(router, "MessageSent")
          .withArgs(chainId, message);
      }
    });

    it("Should handle empty messages", async function () {
      const emptyMessage = "0x";
      await expect(router.ccipSend(POLYGON_CHAIN_ID, emptyMessage))
        .to.emit(router, "MessageSent")
        .withArgs(POLYGON_CHAIN_ID, emptyMessage);
    });

    it("Should handle large messages", async function () {
      const largeMessage = ethers.utils.defaultAbiCoder.encode(
        ["bytes32[]", "address[]", "uint256[]"],
        [
          Array(10).fill(ethers.utils.id("testMessage")),
          Array(10).fill(user1.address),
          Array(10).fill(ethers.utils.parseEther("1.0"))
        ]
      );
      await expect(router.ccipSend(POLYGON_CHAIN_ID, largeMessage))
        .to.emit(router, "MessageSent")
        .withArgs(POLYGON_CHAIN_ID, largeMessage);
    });
  });

  describe("Error Handling", function () {
    it("Should handle zero chain ID", async function () {
      const message = ethers.utils.defaultAbiCoder.encode(
        ["bytes32", "address", "address", "uint256"],
        [ethers.utils.id("testMessage"), user1.address, user2.address, ethers.utils.parseEther("1.0")]
      );
      await expect(router.ccipSend(0, message))
        .to.emit(router, "MessageSent")
        .withArgs(0, message);
    });
  });
});
