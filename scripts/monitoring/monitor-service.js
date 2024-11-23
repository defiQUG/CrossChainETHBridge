const ethers = require('ethers');
const config = require('./config');
const { setupAlerts } = require('./alerts');

async function startMonitoring() {
    try {
        console.log('Initializing monitoring service...');
        const polygonProvider = new ethers.providers.JsonRpcProvider(config.networks.polygon.rpc);
        const defiProvider = new ethers.providers.JsonRpcProvider(config.networks.defiOracle.rpc);

        const CrossChainMessenger = require('../../artifacts/contracts/CrossChainMessenger.sol/CrossChainMessenger.json');
        const polygonContract = new ethers.Contract(
            config.contracts.CrossChainMessenger,
            CrossChainMessenger.abi,
            polygonProvider
        );

        await setupAlerts(polygonContract);
        console.log('Monitoring service started successfully');
    } catch (error) {
        console.error('Failed to start monitoring service', { error, timestamp: new Date().toISOString() });
    }
}

startMonitoring().catch(console.error);
