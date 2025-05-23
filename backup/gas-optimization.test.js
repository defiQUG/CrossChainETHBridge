const { ethers } = require('hardhat'); const { expect } = require('chai'); const { deployTestContracts, TEST_CONFIG } = require('./helpers/setup'); const { deployContract, getContractAt } = require('./helpers/test-utils');

describe("Gas Optimization Tests", function() {
  let crossChainMessenger;
  let owner;
  let user;
  let mockRouter;
  let mockWeth;
  beforeEach(async function() {
    const contracts = await deployTestContracts();
    owner = contracts.owner;
    user = contracts.user;
    addr1 = contracts.addr1;
    addr2 = contracts.addr2;
    mockRouter = contracts.mockRouter;
    mockWETH = contracts.mockWETH;
    crossChainMessenger = contracts.crossChainMessenger;
    [owner, user] = await ethers.getSigners();
    // Deploy MockRouter
    const MockRouter = await ethers.getContractFactory("MockRouter");
    mockRouter = await MockRouter.deploy();
    await mockRouter.waitForDeployment();
    // Deploy MockWETH
    const MockWETH = await ethers.getContractFactory("MockWETH");
    mockWeth = await MockWETH.deploy("Wrapped Ether", "WETH");
    await mockWeth.waitForDeployment();
    // Deploy CrossChainMessenger with router, WETH addresses, and maxMessagesPerPeriod
    const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
    crossChainMessenger = await CrossChainMessenger.deploy(mockRouter.address, mockWeth.address, 100); // 100 messages per period
    await crossChainMessenger.waitForDeployment();
  });
  describe("Gas Usage Analysis", function() {
    it("Should optimize gas for message sending", async function() {
      const amount = ethers.utils.parseEther("1");
      const tx = await crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount });
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.below(300000, "Gas usage too high for message sending");
    });
    it("Should optimize gas for message receiving", async function() {
      // Fund the contract first
      await owner.sendTransaction({
        to: crossChainMessenger.address,
        value: ethers.utils.parseEther("10.0")
      });
      const messageId = ethers.utils.formatBytes32String("testMessage");
      const sourceChainSelector = 138; // Defi Oracle Meta Chain ID
      const sender = ethers.utils.hexZeroPad(owner.address, 32);
      const data = ethers.utils.defaultAbiCoder.encode(
        ['address', 'uint256'],
        [user.address, amount]
      );
      // Create CCIP message format
      const message = {
        messageId: messageId,
        sourceChainSelector: sourceChainSelector,
        sender: sender,
        data: data,
        destTokenAmounts: []
      };
      // Send message directly to the target using MockRouter's sendMessage function
      const tx = await mockRouter.simulateMessageReceived(
        crossChainMessenger.address,
        message
      expect(receipt.gasUsed).to.be.below(500000, "Gas usage too high for message receiving");
});
