const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reentrancy Protection Tests", function () {
  let crossChainMessenger;
  let mockWETH;
  let maliciousContract;
  let owner;
  let attacker;

  beforeEach(async function () {
    [owner, attacker] = await ethers.getSigners();

    // Deploy MockWETH
    const MockWETH = await ethers.getContractFactory("MockWETH");
    mockWETH = await MockWETH.deploy();
    await mockWETH.deployed();

    // Deploy CrossChainMessenger with mock WETH
    const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
    crossChainMessenger = await CrossChainMessenger.deploy(
      mockWETH.address,
      ethers.constants.AddressZero, // Mock router address
      0 // Mock chain selector
    );
    await crossChainMessenger.deployed();

    // Deploy MaliciousReceiver
    const MaliciousReceiver = await ethers.getContractFactory("MaliciousReceiver");
    maliciousContract = await MaliciousReceiver.deploy(crossChainMessenger.address);
    await maliciousContract.deployed();
  });

  it("should prevent reentrancy in ccipReceive", async function () {
    const amount = ethers.utils.parseEther("1.0");

    // Fund contracts
    await mockWETH.deposit({ value: amount });
    await mockWETH.transfer(crossChainMessenger.address, amount);

    // Create message
    const message = {
      messageId: ethers.utils.randomBytes(32),
      sourceChainSelector: 0,
      sender: ethers.constants.AddressZero,
      data: ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256"],
        [maliciousContract.address, amount]
      ),
      destTokenAmounts: [{
        token: mockWETH.address,
        amount: amount
      }]
    };

    // Attempt reentrancy attack
    await expect(
      crossChainMessenger.ccipReceive(message)
    ).to.be.revertedWith("ReentrancyGuard: reentrant call");
  });

  it("should prevent reentrancy in emergencyWithdraw", async function () {
    const amount = ethers.utils.parseEther("1.0");

    // Fund contracts
    await mockWETH.deposit({ value: amount });
    await mockWETH.transfer(crossChainMessenger.address, amount);

    // Attempt reentrancy attack through emergencyWithdraw
    await expect(
      crossChainMessenger.connect(owner).emergencyWithdraw(maliciousContract.address)
    ).to.be.revertedWith("ReentrancyGuard: reentrant call");
  });
});
