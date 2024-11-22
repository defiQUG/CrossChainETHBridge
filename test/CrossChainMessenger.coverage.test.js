const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrossChainMessenger Coverage Tests", function () {
  let messenger;
  let owner;
  let addr1;
  let mockRouter;
  let mockWETH;
  const MAX_MESSAGES_PER_PERIOD = 5;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    // Deploy MockWETH
    const MockWETH = await ethers.getContractFactory("MockWETH");
    mockWETH = await MockWETH.deploy("Wrapped Ether", "WETH");
    await mockWETH.deployed();

    // Deploy MockRouter
    const MockRouter = await ethers.getContractFactory("MockRouter");
    mockRouter = await MockRouter.deploy();
    await mockRouter.deployed();

    // Deploy CrossChainMessenger with router, WETH, and rate limit
    const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
    messenger = await CrossChainMessenger.deploy(
      mockRouter.address,
      mockWETH.address,
      MAX_MESSAGES_PER_PERIOD
    );
    await messenger.deployed();

    // Send initial ETH after deployment
    await owner.sendTransaction({
      to: messenger.address,
      value: ethers.utils.parseEther("1.0")
    });
  });

  describe("Edge Cases and Error Handling", function () {
    it("Should handle zero amount transfers correctly", async function () {
      const recipient = addr1.address;
      await expect(
        messenger.sendToPolygon(recipient, { value: 0 })
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should handle emergency withdrawals correctly", async function () {
      await messenger.pause();
      const amount = ethers.utils.parseEther("1.0");
      await owner.sendTransaction({ to: messenger.address, value: amount });
      await messenger.emergencyWithdraw(owner.address);
      expect(await ethers.provider.getBalance(messenger.address)).to.equal(0);
    });

    it("Should handle invalid chain ID correctly", async function () {
      const recipient = addr1.address;
      await expect(
        messenger.sendToPolygon(recipient, { value: ethers.utils.parseEther("1.0") })
      ).to.be.revertedWith("Invalid chain ID");
    });
  });
});
