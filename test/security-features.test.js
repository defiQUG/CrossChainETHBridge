const { ethers } = require('hardhat');
const { expect } = require('chai');
const { time } = require('@nomicfoundation/hardhat-network-helpers');
const { deployTestContracts, TEST_CONFIG } = require('./helpers/setup');

const { BRIDGE_FEE, MAX_MESSAGES_PER_PERIOD } = TEST_CONFIG;

describe('Security Features', function () {
  let crossChainMessenger;
  let user;

  beforeEach(async function () {
    const contracts = await deployTestContracts();
    user = contracts.user;
    crossChainMessenger = contracts.crossChainMessenger;
  });

  describe('Rate Limiting', function () {
    it('Should enforce rate limits', async function () {
      const amount = BRIDGE_FEE.add(ethers.utils.parseEther('0.01'));

      for (let i = 0; i < MAX_MESSAGES_PER_PERIOD; i++) {
        await crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount });
      }

      await expect(
        crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount })
      ).to.be.revertedWithCustomError(crossChainMessenger, 'RateLimitExceeded');
    });

    it('Should reset rate limit after period', async function () {
      const amount = BRIDGE_FEE.add(ethers.utils.parseEther('0.01'));
      await crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount });
      await time.increase(TEST_CONFIG.PERIOD_DURATION + 1);
      await expect(
        crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount })
      ).to.not.be.reverted;
    });
  });

  describe('Emergency Pause', function () {
    it('Should pause on large transfers', async function () {
      const amount = TEST_CONFIG.PAUSE_THRESHOLD.add(BRIDGE_FEE).add(1);

      await expect(
        crossChainMessenger.connect(user).sendToPolygon(user.address, { value: amount })
      ).to.be.revertedWithCustomError(crossChainMessenger, 'EmergencyPaused');
    });

    it('Should auto-unpause after duration', async function () {
      const largeAmount = TEST_CONFIG.PAUSE_THRESHOLD.add(BRIDGE_FEE).add(1);
      await expect(
        crossChainMessenger.connect(user).sendToPolygon(user.address, { value: largeAmount })
      ).to.be.revertedWithCustomError(crossChainMessenger, 'EmergencyPaused');

      await time.increase(TEST_CONFIG.PAUSE_DURATION + 1);
      const smallAmount = BRIDGE_FEE.add(ethers.utils.parseEther('0.01'));
      await expect(
        crossChainMessenger.connect(user).sendToPolygon(user.address, { value: smallAmount })
      ).to.not.be.reverted;
    });
  });
});
