const ethers = require('ethers');
const config = require('./config');

class MetricsCollector {
  constructor(providers) {
    this.providers = providers;
    this.metrics = {
      pendingMessages: 0,
      gasPrice: {},
      blockDelay: {},
      lastProcessedBlock: {},
      errors: []
    };
  }

  async collectChainMetrics(chainId) {
    const chain = Object.values(config.chains).find(c => c.id === chainId);
    if (!chain) throw new Error(`Chain ${chainId} not configured`);

    const provider = this.providers[chainId];
    try {
      // Collect gas prices
      const gasPrice = await provider.getGasPrice();
      this.metrics.gasPrice[chainId] = ethers.utils.formatUnits(gasPrice, 'gwei');

      // Get latest block
      const latestBlock = await provider.getBlock('latest');
      const timestamp = Math.floor(Date.now() / 1000);
      this.metrics.blockDelay[chainId] = timestamp - latestBlock.timestamp;
      this.metrics.lastProcessedBlock[chainId] = latestBlock.number;

    } catch (error) {
      this.metrics.errors.push({
        chain: chain.name,
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  }

  async collectAllMetrics() {
    const promises = Object.values(config.chains).map(chain =>
      this.collectChainMetrics(chain.id)
    );
    await Promise.all(promises);
    return this.metrics;
  }

  getMetrics() {
    return this.metrics;
  }

  resetMetrics() {
    this.metrics = {
      pendingMessages: 0,
      gasPrice: {},
      blockDelay: {},
      lastProcessedBlock: {},
      errors: []
    };
  }
}

module.exports = MetricsCollector;
