const { AlertType, AlertSeverity } = require('../types/AlertTypes');
const { ALERT_THRESHOLDS } = require('../config/AlertConfig');

class EventHandler {
    constructor() {
        this.alerts = [];
    }

    handleHighValueTransfer(messageId, from, to, amount) {
        if (amount.gt(ALERT_THRESHOLDS.highValue)) {
            this.alerts.push({
                type: AlertType.HIGH_VALUE_TRANSFER,
                severity: AlertSeverity.WARNING,
                details: {
                    messageId,
                    from,
                    to,
                    amount: amount.toString()
                }
            });
        }
    }

    handleContractPaused() {
        this.alerts.push({
            type: AlertType.CONTRACT_PAUSED,
            severity: AlertSeverity.CRITICAL,
            details: {
                timestamp: new Date().toISOString()
            }
        });
    }

    handleContractUnpaused() {
        this.alerts.push({
            type: AlertType.CONTRACT_UNPAUSED,
            severity: AlertSeverity.INFO,
            details: {
                timestamp: new Date().toISOString()
            }
        });
    }

    handlePendingMessages(pendingCount) {
        if (pendingCount > ALERT_THRESHOLDS.pendingMessages) {
            this.alerts.push({
                type: AlertType.PENDING_MESSAGES_THRESHOLD,
                severity: AlertSeverity.CRITICAL,
                details: {
                    pendingCount,
                    threshold: ALERT_THRESHOLDS.pendingMessages
                }
            });
        }
    }

    handleHighProcessingTime(messageId, processingTime) {
        if (processingTime > ALERT_THRESHOLDS.processingTime) {
            this.alerts.push({
                type: AlertType.HIGH_PROCESSING_TIME,
                severity: AlertSeverity.WARNING,
                details: {
                    messageId,
                    processingTime,
                    threshold: ALERT_THRESHOLDS.processingTime
                }
            });
        }
    }

    handleChainConnectivityError(error) {
        this.alerts.push({
            type: AlertType.CHAIN_CONNECTIVITY,
            severity: AlertSeverity.CRITICAL,
            details: {
                error: error.message
            }
        });
    }

    getAlerts() {
        return this.alerts;
    }

    clearAlerts() {
        this.alerts = [];
    }
}

module.exports = EventHandler;
