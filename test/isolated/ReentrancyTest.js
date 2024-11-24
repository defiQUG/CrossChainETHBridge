const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reentrancy Protection Tests", function () {
  let crossChainMessenger;
  let mockWETH;
  let maliciousContract;
  let mockRouter;
  let mockEmergencyPause;
  let owner;
  let attacker;

  beforeEach(async function () {
    [owner, attacker] = await ethers.getSigners();

    // Deploy MockWETH
    const MockWETH = await ethers.getContractFactory("MockWETH");
    mockWETH = await MockWETH.deploy("Wrapped Ether", "WETH");
    await mockWETH.deployed();

    // Deploy MockRouter
    const MockRouter = await ethers.getContractFactory("MockRouter");
    mockRouter = await MockRouter.deploy();
    await mockRouter.deployed();

    // Deploy MockEmergencyPause
    const MockEmergencyPause = await ethers.getContractFactory("EmergencyPause");
    mockEmergencyPause = await MockEmergencyPause.deploy(
      ethers.utils.parseEther("1.0"), // pauseThreshold
      3600 // pauseDuration (1 hour)
    );
    await mockEmergencyPause.deployed();

    // Deploy CrossChainMessenger with mocks
    const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
    crossChainMessenger = await CrossChainMessenger.deploy(
      mockRouter.address,
      mockWETH.address,
      owner.address,
      mockEmergencyPause.address,
      ethers.utils.parseEther("0.01"),
      ethers.utils.parseEther("0.1")
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
      messageId: ethers.utils.hexZeroPad(ethers.utils.hexlify(1), 32),
      sourceChainSelector: 138,
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

    // Set emergency pause
    await mockEmergencyPause.pause();

    // Attempt reentrancy attack through emergencyWithdraw
    await expect(
      crossChainMessenger.connect(owner).emergencyWithdraw(maliciousContract.address)
    ).to.be.revertedWith("ReentrancyGuard: reentrant call");
  });
});
