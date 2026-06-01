const { ethers } = require('hardhat');
const { expect } = require('chai');
const { deployTestContracts, TEST_CONFIG } = require('./helpers/setup');

const { BRIDGE_FEE, POLYGON_CHAIN_SELECTOR, DEFI_ORACLE_META_CHAIN_SELECTOR } = TEST_CONFIG;

describe('Gas Optimization Tests', function () {
  let crossChainMessenger;
  let owner;
  let user;
  let mockRouter;
  let mockWeth;

  beforeEach(async function () {
    const contracts = await deployTestContracts();
    owner = contracts.owner;
    user = contracts.user;
    mockRouter = contracts.mockRouter;
    mockWeth = contracts.mockWETH;
    crossChainMessenger = contracts.crossChainMessenger;
  });

  describe('Gas Usage Analysis', function () {
    it('Should optimize gas for message sending', async function () {
      const amount = ethers.utils.parseEther('1.0');
      const data = ethers.utils.defaultAbiCoder.encode(['address', 'uint256'], [user.address, amount]);

      const message = {
        receiver: crossChainMessenger.address,
        data,
        tokenAmounts: [],
        feeToken: ethers.constants.AddressZero,
        extraArgs: '0x',
      };

      const fee = await mockRouter.getFee(POLYGON_CHAIN_SELECTOR, message);
      const totalValue = amount.add(fee);

      const sendTx = await crossChainMessenger.connect(user).sendToPolygon(user.address, { value: totalValue });
      const sendReceipt = await sendTx.wait();
      expect(sendReceipt.gasUsed).to.be.below(300000, 'Gas usage too high for message sending');
    });

    it('Should optimize gas for message receiving', async function () {
      await owner.sendTransaction({
        to: crossChainMessenger.address,
        value: ethers.utils.parseEther('10.0'),
      });
      await mockWeth.deposit({ value: ethers.utils.parseEther('5.0') });
      await mockWeth.transfer(crossChainMessenger.address, ethers.utils.parseEther('5.0'));

      const amount = ethers.utils.parseEther('1.0');
      const data = ethers.utils.defaultAbiCoder.encode(['address', 'uint256'], [user.address, amount]);

      const message = {
        messageId: ethers.utils.keccak256(ethers.utils.randomBytes(32)),
        sourceChainSelector: DEFI_ORACLE_META_CHAIN_SELECTOR,
        sender: ethers.utils.hexZeroPad(owner.address, 20),
        data,
        destTokenAmounts: [],
        feeToken: ethers.constants.AddressZero,
        extraArgs: '0x',
      };

      const receiveTx = await mockRouter.simulateMessageReceived(crossChainMessenger.address, message, {
        value: amount,
      });
      const receiveReceipt = await receiveTx.wait();
      expect(receiveReceipt.gasUsed).to.be.below(500000, 'Gas usage too high for message receiving');

      await owner.sendTransaction({ to: crossChainMessenger.address, value: amount });
      await mockWeth.deposit({ value: amount });
      await mockWeth.transfer(crossChainMessenger.address, amount);

      const message2 = {
        ...message,
        messageId: ethers.utils.keccak256(ethers.utils.randomBytes(32)),
      };

      const tx = await mockRouter.simulateMessageReceived(crossChainMessenger.address, message2, {
        value: amount,
      });
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.below(500000, 'Gas usage too high for message receiving');
    });
  });
});
