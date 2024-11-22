const { ethers } = require("ethers");

class MessageTracker {
    constructor(config) {
        this.config = config;
        this.messages = new Map();
        this.providers = this._initializeProviders();
    }

    _initializeProviders() {
        const providers = {};
        for (const [network, info] of Object.entries(this.config.networks)) {
            providers[network] = new ethers.providers.JsonRpcProvider(info.rpcUrl);
        }
        return providers;
    }

    async trackMessage(messageId, sourceChain, destChain, timestamp) {
        this.messages.set(messageId, {
            id: messageId,
            sourceChain,
            destChain,
            timestamp,
            status: 'PENDING',
            delays: [],
            retries: 0
        });
    }

    async checkMessageStatus(messageId) {
        const message = this.messages.get(messageId);
        if (!message) return null;

        const delay = Date.now() - message.timestamp;
        message.delays.push(delay);

        if (delay > this.config.thresholds.messageDelay.critical) {
            message.status = 'CRITICAL_DELAY';
        } else if (delay > this.config.thresholds.messageDelay.warning) {
            message.status = 'WARNING_DELAY';
        }

        return message;
    }

    async getFailedMessages() {
        return Array.from(this.messages.values())
            .filter(msg => ['FAILED', 'CRITICAL_DELAY'].includes(msg.status));
    }

    async getMetrics() {
        const metrics = {
            totalMessages: this.messages.size,
            pendingMessages: 0,
            completedMessages: 0,
            failedMessages: 0,
            averageDelay: 0
        };

        let totalDelay = 0;
        for (const message of this.messages.values()) {
            switch (message.status) {
                case 'PENDING':
                    metrics.pendingMessages++;
                    break;
                case 'COMPLETED':
                    metrics.completedMessages++;
                    break;
                case 'FAILED':
                case 'CRITICAL_DELAY':
                    metrics.failedMessages++;
                    break;
            }
            if (message.delays.length > 0) {
                totalDelay += message.delays[message.delays.length - 1];
            }
        }

        if (this.messages.size > 0) {
            metrics.averageDelay = totalDelay / this.messages.size;
        }

        return metrics;
    }
}

module.exports = MessageTracker;
