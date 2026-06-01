const { expect } = require('chai');
const { ethers } = require('hardhat');
const { collectMetrics } = require('../../scripts/monitoring/metrics');
const AlertMonitor = require('../../scripts/monitoring/alerts');
const CircularBuffer = require('../../scripts/monitoring/CircularBuffer');
const { deployTestContracts, TEST_CONFIG } = require('../helpers/setup');

describe('Monitoring System', function () {
  let messenger;
  let owner;
  let alertMonitor;
  let buffer;

  beforeEach(async function () {
    const contracts = await deployTestContracts();
    owner = contracts.owner;
    messenger = contracts.crossChainMessenger;
    alertMonitor = new AlertMonitor();
    buffer = new CircularBuffer(100);
  });

  describe('Metrics Collection', function () {
    it('should collect message events', async function () {
      const amount = TEST_CONFIG.BRIDGE_FEE.add(ethers.utils.parseEther('1.0'));
      await messenger.connect(owner).sendToPolygon(owner.address, { value: amount });

      const metrics = await collectMetrics(messenger, 1);
      expect(metrics.messagesSent).to.equal(1);
      expect(metrics.gasUsed.toArray().length).to.be.greaterThan(0);
    });

    it('should maintain circular buffer size', async function () {
      for (let i = 0; i < 150; i++) {
        buffer.push(i);
      }
      const values = buffer.toArray();
      expect(values.length).to.equal(100);
      expect(values[99]).to.equal(149);
    });
  });

  describe('Alert Monitoring', function () {
    it('should detect high value transfers', async function () {
      const amount = TEST_CONFIG.BRIDGE_FEE.add(ethers.utils.parseEther('11.0'));
      await messenger.connect(owner).sendToPolygon(owner.address, { value: amount });

      const alerts = await alertMonitor.monitorBridge(messenger, 1);
      const highValueAlerts = alerts.filter((a) => a.type === 'HIGH_VALUE_TRANSFER');
      expect(highValueAlerts.length).to.be.greaterThan(0);
    });

    it('should track contract pause events', async function () {
      await messenger.pause();
      const alerts = await alertMonitor.monitorBridge(messenger, 1);
      const pauseAlerts = alerts.filter((a) => a.type === 'CONTRACT_PAUSED');
      expect(pauseAlerts.length).to.equal(1);
    });
  });
});
