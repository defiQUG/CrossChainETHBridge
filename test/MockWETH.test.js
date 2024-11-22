const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MockWETH", function () {
  let mockWETH;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const MockWETH = await ethers.getContractFactory("MockWETH");
    mockWETH = await MockWETH.deploy();
    await mockWETH.deployed();
  });

  describe("Deployment", function () {
    it("Should have correct name and symbol", async function () {
      expect(await mockWETH.name()).to.equal("Wrapped Ether");
      expect(await mockWETH.symbol()).to.equal("WETH");
    });
  });

  describe("Deposit", function () {
    it("Should mint WETH when ETH is deposited", async function () {
      const depositAmount = ethers.utils.parseEther("1.0");
      await mockWETH.connect(addr1).deposit({ value: depositAmount });
      expect(await mockWETH.balanceOf(addr1.address)).to.equal(depositAmount);
    });

    it("Should emit Transfer event on deposit", async function () {
      const depositAmount = ethers.utils.parseEther("1.0");
      await expect(mockWETH.connect(addr1).deposit({ value: depositAmount }))
        .to.emit(mockWETH, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, depositAmount);
    });
  });

  describe("Withdraw", function () {
    it("Should burn WETH and return ETH on withdrawal", async function () {
      const amount = ethers.utils.parseEther("1.0");
      await mockWETH.connect(addr1).deposit({ value: amount });

      const initialBalance = await addr1.getBalance();
      const tx = await mockWETH.connect(addr1).withdraw(amount);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(tx.gasPrice);

      expect(await mockWETH.balanceOf(addr1.address)).to.equal(0);
      expect(await addr1.getBalance()).to.equal(initialBalance.sub(gasUsed));
    });

    it("Should revert withdrawal with insufficient balance", async function () {
      const amount = ethers.utils.parseEther("1.0");
      await expect(mockWETH.connect(addr1).withdraw(amount))
        .to.be.revertedWith("MockWETH: insufficient balance");
    });
  });

  describe("Receive Function", function () {
    it("Should mint WETH when receiving ETH", async function () {
      const amount = ethers.utils.parseEther("1.0");
      await addr1.sendTransaction({
        to: mockWETH.address,
        value: amount
      });
      expect(await mockWETH.balanceOf(addr1.address)).to.equal(amount);
    });
  });
});
