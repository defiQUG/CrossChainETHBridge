const { ethers } = require('hardhat'); const { expect } = require('chai'); const { deployTestContracts, TEST_CONFIG } = require('./helpers/setup'); const { deployContract, getContractAt } = require('./helpers/test-utils');

describe("MockRouter Extended Tests", function () {
  let router, owner, user1, user2;
  const POLYGON_CHAIN_ID = 137;
  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const MockRouter = await ethers.getContractFactory("MockRouter");
    router = await MockRouter.deploy();
    await router.waitForDeployment();
  });
  describe("Message Handling", function () {
    it("Should handle ccipSend with correct parameters", async function () {
      const message = {
        receiver: ethers.utils.defaultAbiCoder.encode(["address"], [user2.address]),
        data: ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [user1.address, ethers.utils.parseEther("1.0")]),
        tokenAmounts: [],
        extraArgs: "0x",
        feeToken: ethers.constants.AddressZero
      };
      const tx = await router.ccipSend(POLYGON_CHAIN_ID, message);
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === "MessageSent");
      expect(event).to.not.be.undefined;
      expect(event.args.destinationChainSelector).to.equal(POLYGON_CHAIN_ID);
    });
    it("Should handle multiple messages correctly", async function () {
      for (let i = 0; i < 3; i++) {
        const message = {
          receiver: ethers.utils.defaultAbiCoder.encode(["address"], [user2.address]),
          data: ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [user1.address, ethers.utils.parseEther("1.0")]),
          tokenAmounts: [],
          extraArgs: "0x",
          feeToken: ethers.constants.AddressZero
        };
        await router.ccipSend(POLYGON_CHAIN_ID, message);
      }
      const events = await router.queryFilter(router.filters.MessageSent());
      expect(events.length).to.equal(3);
    it("Should handle messages with different chain IDs", async function () {
      await expect(router.ccipSend(POLYGON_CHAIN_ID, message))
        .to.emit(router, "MessageSent")
        .withArgs(POLYGON_CHAIN_ID, ethers.utils.defaultAbiCoder.encode(
          ["bytes", "bytes", "tuple[]", "bytes", "address"],
          [message.receiver, message.data, [], message.extraArgs, message.feeToken]
        ));
    it("Should handle empty messages", async function () {
        data: "0x",
        .to.emit(router, "MessageSent");
  describe("Error Handling", function () {
    it("Should handle zero chain ID", async function () {
      await expect(router.ccipSend(0, message))
        .to.be.revertedWith("Invalid chain selector");
});
