const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

// Metrics collection configuration
const METRICS_DIR = path.join(__dirname, '../../logs/metrics');
const COLLECTION_INTERVAL = 60000; // 1 minute

// Ensure metrics directory exists
if (!fs.existsSync(METRICS_DIR)) {
    fs.mkdirSync(METRICS_DIR, { recursive: true });
}

// Core metrics tracking
const metrics = {
    messagesSent: 0,
    messagesReceived: 0,
    averageProcessingTime: 0,
    failedMessages: 0,
    gasUsed: []
};

async function collectMetrics(messenger, chainId) {
    try {
        // Get contract events
        const filter = {
            fromBlock: 'latest',
            toBlock: 'latest'
        };

        const messageSentFilter = messenger.filters.MessageSent();
        const messageReceivedFilter = messenger.filters.MessageReceived();

        const sentLogs = await messenger.queryFilter(messageSentFilter, filter.fromBlock, filter.toBlock);
        const receivedLogs = await messenger.queryFilter(messageReceivedFilter, filter.fromBlock, filter.toBlock);

        // Update metrics
        metrics.messagesSent += sentLogs.length;
        metrics.messagesReceived += receivedLogs.length;

        // Calculate gas usage
        for (const log of [...sentLogs, ...receivedLogs]) {
            const receipt = await log.getTransactionReceipt();
            metrics.gasUsed.push(receipt.gasUsed.toString());
        }

        // Save metrics to file
        const timestamp = new Date().toISOString();
        const metricsData = {
            timestamp,
            chainId,
            metrics: {
                ...metrics,
                gasUsed: metrics.gasUsed.slice(-100) // Keep last 100 gas measurements
            }
        };

        const filename = path.join(METRICS_DIR, `metrics_${chainId}_${timestamp.split('T')[0]}.json`);
        fs.writeFileSync(filename, JSON.stringify(metricsData, null, 2));

        console.log(`Metrics collected for chain ${chainId} at ${timestamp}`);
        return metrics;
    } catch (error) {
        console.error('Error collecting metrics:', error);
        throw error;
    }
}

module.exports = {
    collectMetrics,
    COLLECTION_INTERVAL
};
