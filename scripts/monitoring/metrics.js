const { ethers } = require('hardhat');
const fs = require('fs').promises;
const path = require('path');
const CircularBuffer = require('./CircularBuffer');

// Metrics collection configuration
const METRICS_DIR = path.join(__dirname, '../../logs/metrics');
const COLLECTION_INTERVAL = 60000; // 1 minute
const GAS_BUFFER_SIZE = 100;

// Ensure metrics directory exists
async function ensureMetricsDir() {
    await fs.mkdir(METRICS_DIR, { recursive: true });
}

// Core metrics tracking
const metrics = {
    messagesSent: 0,
    messagesReceived: 0,
    averageProcessingTime: 0,
    failedMessages: 0,
    gasUsed: new CircularBuffer(GAS_BUFFER_SIZE)
};

async function collectMetrics(messenger, chainId) {
    try {
        await ensureMetricsDir();

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
                gasUsed: metrics.gasUsed.toArray() // Use CircularBuffer's toArray method
            }
        };

        const filename = path.join(METRICS_DIR, `metrics_${chainId}_${timestamp.split('T')[0]}.json`);
        await fs.writeFile(filename, JSON.stringify(metricsData, null, 2));

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
