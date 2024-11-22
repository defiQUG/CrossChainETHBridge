const ethers = require('ethers');
const config = require('./config');

async function setupAlerts(contract) {
    console.log('Setting up alert system...');

    // Monitor for MessageSent events
    contract.on('MessageSent', (messageId, sender, recipient, amount) => {
        console.log(`Message Sent - ID: ${messageId}`);
        console.log(`From: ${sender} To: ${recipient}`);
        console.log(`Amount: ${ethers.utils.formatEther(amount)} ETH`);
    });

    // Monitor for MessageReceived events
    contract.on('MessageReceived', (messageId, sender, recipient, amount) => {
        console.log(`Message Received - ID: ${messageId}`);
        console.log(`From: ${sender} To: ${recipient}`);
        console.log(`Amount: ${ethers.utils.formatEther(amount)} ETH`);
    });

    console.log('Alert system configured successfully');
}

module.exports = { setupAlerts };
