const { ethers } = require('hardhat');
const { collectMetrics, COLLECTION_INTERVAL } = require('./metrics');
const { checkAlerts, AlertType, AlertSeverity } = require('./alerts');
const path = require('path');
const fs = require('fs');

// Dashboard configuration
const DASHBOARD_DIR = path.join(__dirname, '../../logs/dashboard');
const UPDATE_INTERVAL = 300000; // 5 minutes

// Ensure dashboard directory exists
if (!fs.existsSync(DASHBOARD_DIR)) {
    fs.mkdirSync(DASHBOARD_DIR, { recursive: true });
}

// Chain configurations
const CHAINS = {
    138: 'Defi Oracle Meta',
    137: 'Polygon PoS'
};

async function startMonitoring(messengerAddress) {
    console.log('Starting cross-chain monitoring dashboard...');

    // Initialize connections to both chains
    const providers = {};
    const messengers = {};

    for (const chainId of Object.keys(CHAINS)) {
        try {
            const provider = new ethers.providers.JsonRpcProvider(process.env[`RPC_URL_${chainId}`]);
            providers[chainId] = provider;

            const CrossChainMessenger = await ethers.getContractFactory('CrossChainMessenger');
            messengers[chainId] = CrossChainMessenger.attach(messengerAddress).connect(provider);

            console.log(`Connected to ${CHAINS[chainId]} (Chain ID: ${chainId})`);
        } catch (error) {
            console.error(`Failed to connect to chain ${chainId}:`, error);
        }
    }

    // Start monitoring loops
    setInterval(async () => {
        const timestamp = new Date().toISOString();
        const dashboard = {
            timestamp,
            chains: {}
        };

        for (const [chainId, messenger] of Object.entries(messengers)) {
            try {
                // Collect metrics
                const metrics = await collectMetrics(messenger, chainId);

                // Check for alerts
                const alerts = await checkAlerts(messenger, chainId);

                // Update dashboard
                dashboard.chains[chainId] = {
                    name: CHAINS[chainId],
                    metrics,
                    alerts,
                    status: alerts.length > 0 ? 'WARNING' : 'HEALTHY'
                };
            } catch (error) {
                console.error(`Error monitoring chain ${chainId}:`, error);
                dashboard.chains[chainId] = {
                    name: CHAINS[chainId],
                    status: 'ERROR',
                    error: error.message
                };
            }
        }

        // Save dashboard state
        const filename = path.join(DASHBOARD_DIR, `dashboard_${timestamp.split('T')[0]}.json`);
        fs.writeFileSync(filename, JSON.stringify(dashboard, null, 2));

        // Log summary
        console.log('\nDashboard Update:', timestamp);
        for (const [chainId, data] of Object.entries(dashboard.chains)) {
            console.log(`${data.name}: ${data.status}`);
            if (data.alerts?.length > 0) {
                console.log(`- ${data.alerts.length} active alerts`);
            }
        }
    }, UPDATE_INTERVAL);

    console.log('Monitoring dashboard started. Update interval:', UPDATE_INTERVAL / 1000, 'seconds');
}

module.exports = {
    startMonitoring,
    CHAINS
};
