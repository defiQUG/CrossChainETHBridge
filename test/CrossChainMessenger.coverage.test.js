const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrossChainMessenger Coverage Tests", function () {
  let messenger;
  let owner;
  let addr1;
  let mockRouter;
  let mockWETH;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const MockRouter = await ethers.getContractFactory("MockRouter");
    mockRouter = await MockRouter.deploy();
    await mockRouter.deployed();

    const MockWETH = await ethers.getContractFactory("MockWETH");
    mockWETH = await MockWETH.deploy();
    await mockWETH.deployed();

    const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
    messenger = await CrossChainMessenger.deploy(
      mockRouter.address,
      mockWETH.address,
      ethers.utils.parseUnits("100", 0) // Set max messages per period to 100
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
      await expect(
        messenger.sendToPolygon({ value: 0 })
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
      await expect(
        messenger.sendToPolygon({ value: ethers.utils.parseEther("1.0") })
      ).to.be.revertedWith("Invalid chain ID");
    });
  });
});
