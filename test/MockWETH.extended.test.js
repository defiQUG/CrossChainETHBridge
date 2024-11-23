const { getSigners, parseEther, deployContract } = require("./helpers/ethers-setup");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MockWETH Extended Tests", function () {
  let mockWETH;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const MockWETH = await ethers.getContractFactory("MockWETH");
    mockWETH = await MockWETH.deploy("Wrapped Ether", "WETH");
    await mockWETH.deployed();
  });

  describe("Token Metadata", function () {
    it("Should have correct name and symbol", async function () {
      expect(await mockWETH.name()).to.equal("Wrapped Ether");
      expect(await mockWETH.symbol()).to.equal("WETH");
    });

    it("Should have 18 decimals", async function () {
      expect(await mockWETH.decimals()).to.equal(18);
    });
  });

  describe("Deposit and Withdrawal", function () {
    it("Should handle multiple deposits and withdrawals", async function () {
      const depositAmount = ethers.utils.parseEther("1.0");
      await mockWETH.deposit({ value: depositAmount });
      await mockWETH.connect(addr1).deposit({ value: depositAmount });

      expect(await mockWETH.balanceOf(owner.address)).to.equal(depositAmount);
      expect(await mockWETH.balanceOf(addr1.address)).to.equal(depositAmount);

      await mockWETH.withdraw(depositAmount);
      await mockWETH.connect(addr1).withdraw(depositAmount);

      expect(await mockWETH.balanceOf(owner.address)).to.equal(0);
      expect(await mockWETH.balanceOf(addr1.address)).to.equal(0);
    });

    it("Should fail withdrawal with insufficient balance", async function () {
      const depositAmount = ethers.utils.parseEther("1.0");
      const withdrawAmount = ethers.utils.parseEther("2.0");

      await mockWETH.deposit({ value: depositAmount });
      await expect(
        mockWETH.withdraw(withdrawAmount)
      ).to.be.revertedWith("insufficient balance");
    });
  });

  describe("Transfer Functionality", function () {
    it("Should handle transfers between accounts", async function () {
      const depositAmount = ethers.utils.parseEther("1.0");
      const transferAmount = ethers.utils.parseEther("0.5");

      await mockWETH.deposit({ value: depositAmount });
      await mockWETH.transfer(addr1.address, transferAmount);

      expect(await mockWETH.balanceOf(owner.address)).to.equal(transferAmount);
      expect(await mockWETH.balanceOf(addr1.address)).to.equal(transferAmount);
    });

    it("Should handle transferFrom with approval", async function () {
      const depositAmount = ethers.utils.parseEther("1.0");
      const approveAmount = ethers.utils.parseEther("0.5");

      await mockWETH.deposit({ value: depositAmount });
      await mockWETH.approve(addr1.address, approveAmount);
      await mockWETH.connect(addr1).transferFrom(owner.address, addr2.address, approveAmount);

      expect(await mockWETH.balanceOf(addr2.address)).to.equal(approveAmount);
    });
  });
});
