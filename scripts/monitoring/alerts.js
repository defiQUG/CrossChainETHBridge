const config = require('./config');

class AlertSystem {
  constructor() {
    this.pendingAlerts = [];
  }

  async checkThresholds(metrics) {
    const { alertThresholds } = config.monitoring;

    // Check pending messages
    if (metrics.pendingMessages > alertThresholds.pendingMessages) {
      this.createAlert('HIGH', `High number of pending messages: ${metrics.pendingMessages}`);
    }

    // Check gas prices for each chain
    Object.entries(metrics.gasPrice).forEach(([chainId, gasPrice]) => {
      const chain = Object.values(config.chains).find(c => c.id === parseInt(chainId));
      if (gasPrice > alertThresholds.gasPrice) {
        this.createAlert('MEDIUM', `High gas price on ${chain.name}: ${gasPrice} gwei`);
      }
    });

    // Check block delays
    Object.entries(metrics.blockDelay).forEach(([chainId, delay]) => {
      const chain = Object.values(config.chains).find(c => c.id === parseInt(chainId));
      if (delay > alertThresholds.blockDelay) {
        this.createAlert('HIGH', `High block delay on ${chain.name}: ${delay} seconds`);
      }
    });

    // Check for errors
    metrics.errors.forEach(error => {
      this.createAlert('HIGH', `Error on ${error.chain}: ${error.error}`);
    });
  }

  createAlert(severity, message) {
    const alert = {
      severity,
      message,
      timestamp: new Date().toISOString()
    };
    this.pendingAlerts.push(alert);
    this.sendAlert(alert);
  }

  async sendAlert(alert) {
    if (!config.alerts.enabled) return;

    const { channels } = config.alerts;

    try {
      // Discord webhook notification
      if (channels.discord) {
        const payload = {
          content: `[${alert.severity}] ${alert.message}`,
          username: 'CrossChainETHBridge Monitor'
        };

        await fetch(channels.discord, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      // Email notification (implement your email service here)
      if (channels.email) {
        console.log(`Would send email to ${channels.email}: ${alert.message}`);
      }
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }

  getAlerts() {
    return this.pendingAlerts;
  }

  clearAlerts() {
    this.pendingAlerts = [];
  }
}

module.exports = AlertSystem;
