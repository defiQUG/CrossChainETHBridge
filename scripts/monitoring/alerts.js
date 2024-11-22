const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

// Alert configuration
const ALERTS_DIR = path.join(__dirname, '../../logs/alerts');
const ALERT_THRESHOLDS = {
    processingTime: 3600, // 1 hour in seconds
    pendingMessages: 100,  // Maximum number of pending messages
    failureRate: 0.05     // 5% failure rate threshold
};

// Ensure alerts directory exists
if (!fs.existsSync(ALERTS_DIR)) {
    fs.mkdirSync(ALERTS_DIR, { recursive: true });
}

// Alert types
const AlertType = {
    HIGH_PROCESSING_TIME: 'HIGH_PROCESSING_TIME',
    PENDING_MESSAGES_THRESHOLD: 'PENDING_MESSAGES_THRESHOLD',
    HIGH_FAILURE_RATE: 'HIGH_FAILURE_RATE',
    CHAIN_CONNECTIVITY: 'CHAIN_CONNECTIVITY'
};

// Alert severity levels
const AlertSeverity = {
    INFO: 'INFO',
    WARNING: 'WARNING',
    CRITICAL: 'CRITICAL'
};

async function checkAlerts(messenger, chainId) {
    const alerts = [];
    const timestamp = new Date().toISOString();

    try {
        // Check pending messages
        const pendingFilter = messenger.filters.MessageSent();
        const completedFilter = messenger.filters.MessageReceived();

        const pendingMessages = await messenger.queryFilter(pendingFilter);
        const completedMessages = await messenger.queryFilter(completedFilter);

        const pendingCount = pendingMessages.length - completedMessages.length;

        // Check processing times
        for (const message of pendingMessages) {
            const messageTime = (await message.getBlock()).timestamp;
            const currentTime = Math.floor(Date.now() / 1000);
            const processingTime = currentTime - messageTime;

            if (processingTime > ALERT_THRESHOLDS.processingTime) {
                alerts.push({
                    type: AlertType.HIGH_PROCESSING_TIME,
                    severity: AlertSeverity.WARNING,
                    details: {
                        messageId: message.args.messageId,
                        processingTime,
                        threshold: ALERT_THRESHOLDS.processingTime
                    }
                });
            }
        }

        // Check pending message count
        if (pendingCount > ALERT_THRESHOLDS.pendingMessages) {
            alerts.push({
                type: AlertType.PENDING_MESSAGES_THRESHOLD,
                severity: AlertSeverity.CRITICAL,
                details: {
                    pendingCount,
                    threshold: ALERT_THRESHOLDS.pendingMessages
                }
            });
        }

        // Save alerts to file
        if (alerts.length > 0) {
            const alertData = {
                timestamp,
                chainId,
                alerts
            };

            const filename = path.join(ALERTS_DIR, `alerts_${chainId}_${timestamp.split('T')[0]}.json`);
            fs.writeFileSync(filename, JSON.stringify(alertData, null, 2));
            console.log(`Generated ${alerts.length} alerts for chain ${chainId}`);
        }

        return alerts;
    } catch (error) {
        console.error('Error checking alerts:', error);
        // Add connectivity alert
        alerts.push({
            type: AlertType.CHAIN_CONNECTIVITY,
            severity: AlertSeverity.CRITICAL,
            details: {
                error: error.message
            }
        });
        return alerts;
    }
}

module.exports = {
    checkAlerts,
    AlertType,
    AlertSeverity,
    ALERT_THRESHOLDS
};
