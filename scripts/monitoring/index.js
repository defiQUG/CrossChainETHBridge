const ethers = require('ethers');
const MetricsCollector = require('./metrics');
const AlertSystem = require('./alerts');
const config = require('./config');

class MonitoringSystem {
  constructor() {
    this.providers = {};
    this.setupProviders();
    this.metricsCollector = new MetricsCollector(this.providers);
    this.alertSystem = new AlertSystem();
    this.isRunning = false;
  }

  setupProviders() {
    Object.entries(config.networks).forEach(([name, network]) => {
      if (!network.rpcUrl) {
        console.warn(`No RPC URL configured for ${name}`);
        return;
      }
      try {
        this.providers[network.chainId] = new ethers.providers.JsonRpcProvider(network.rpcUrl);
        console.log(`Provider setup complete for ${name} (Chain ID: ${network.chainId})`);
      } catch (error) {
        console.error(`Failed to setup provider for ${name}:`, error);
      }
    });
  }

  async start() {
    if (this.isRunning) {
      console.warn('Monitoring system is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting monitoring system...');

    const monitor = async () => {
      try {
        // Collect metrics
        const metrics = await this.metricsCollector.collectAllMetrics();

        // Check for alerts
        await this.alertSystem.checkThresholds(metrics);

        // Log current state
        console.log('Current metrics:', JSON.stringify(metrics, null, 2));
        console.log('Pending alerts:', this.alertSystem.getAlerts());

      } catch (error) {
        console.error('Error in monitoring cycle:', error);
      }

      // Schedule next run if still running
      if (this.isRunning) {
        setTimeout(monitor, config.monitoring.interval);
      }
    };

    // Start monitoring loop
    await monitor();
  }

  stop() {
    console.log('Stopping monitoring system...');
    this.isRunning = false;
  }

  getMetrics() {
    return this.metricsCollector.getMetrics();
  }

  getAlerts() {
    return this.alertSystem.getAlerts();
  }
}

// Create and export singleton instance
const monitor = new MonitoringSystem();

module.exports = monitor;

// Start monitoring if running directly
if (require.main === module) {
  monitor.start()
    .catch(error => {
      console.error('Failed to start monitoring:', error);
      process.exit(1);
    });
}
