const { ethers } = require('hardhat');
const { AlertType, AlertSeverity } = require('./types/AlertTypes');
const { ALERT_THRESHOLDS } = require('./config/AlertConfig');
const EventHandler = require('./handlers/EventHandler');
const AlertStorage = require('./storage/AlertStorage');

class AlertMonitor {
    constructor() {
        this.eventHandler = new EventHandler();
        this.alertStorage = new AlertStorage();
    }

    async monitorBridge(bridgeContract, chainId) {
        try {
            // Monitor high value transfers
            bridgeContract.on('MessageSent', async (messageId, from, to, amount) => {
                this.eventHandler.handleHighValueTransfer(messageId, from, to, amount);
                await this.saveCurrentAlerts(chainId);
            });

            // Monitor contract pause events
            bridgeContract.on('Paused', async () => {
                this.eventHandler.handleContractPaused();
                await this.saveCurrentAlerts(chainId);
            });

            // Monitor contract unpause events
            bridgeContract.on('Unpaused', async () => {
                this.eventHandler.handleContractUnpaused();
                await this.saveCurrentAlerts(chainId);
            });

            // Monitor pending messages
            setInterval(async () => {
                try {
                    const pendingCount = await bridgeContract.getPendingMessageCount();
                    this.eventHandler.handlePendingMessages(pendingCount);
                    await this.saveCurrentAlerts(chainId);
                } catch (error) {
                    console.error('Error checking pending messages:', error);
                    this.eventHandler.handleChainConnectivityError(error);
                    await this.saveCurrentAlerts(chainId);
                }
            }, 300000); // Check every 5 minutes

            console.log(`Alert monitoring started for chain ${chainId}`);
        } catch (error) {
            console.error('Error setting up alert monitoring:', error);
            this.eventHandler.handleChainConnectivityError(error);
            await this.saveCurrentAlerts(chainId);
        }
    }

    async saveCurrentAlerts(chainId) {
        const alerts = this.eventHandler.getAlerts();
        await this.alertStorage.saveAlerts(chainId, alerts);
        this.eventHandler.clearAlerts();
    }
}

module.exports = AlertMonitor;
