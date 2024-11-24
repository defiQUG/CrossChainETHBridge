const fs = require('fs').promises;
const path = require('path');
const { ALERTS_DIR } = require('../config/AlertConfig');

class AlertStorage {
    constructor() {
        this.ensureAlertsDir();
    }

    async ensureAlertsDir() {
        await fs.mkdir(ALERTS_DIR, { recursive: true });
    }

    async saveAlerts(chainId, alerts) {
        if (alerts.length === 0) {
            return;
        }

        const timestamp = new Date().toISOString();
        const alertData = {
            timestamp,
            chainId,
            alerts
        };

        const filename = path.join(ALERTS_DIR, `alerts_${chainId}_${timestamp.split('T')[0]}.json`);
        await fs.writeFile(filename, JSON.stringify(alertData, null, 2));
        console.log(`Generated ${alerts.length} alerts for chain ${chainId}`);
    }

    async getAlerts(chainId, date) {
        const filename = path.join(ALERTS_DIR, `alerts_${chainId}_${date}.json`);
        try {
            const data = await fs.readFile(filename, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                return { alerts: [] };
            }
            throw error;
        }
    }
}

module.exports = AlertStorage;
