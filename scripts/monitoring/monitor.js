const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function setupMonitoring() {
  console.log('Setting up monitoring infrastructure...');

  // Load contract addresses
  const addresses = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../deployments/addresses.json'))
  );

  // Set up event listeners
  const messenger = await ethers.getContractAt('CrossChainMessenger', addresses.CrossChainMessenger);
  const rateLimiter = await ethers.getContractAt('RateLimiter', addresses.RateLimiter);
  const emergencyPause = await ethers.getContractAt('EmergencyPause', addresses.EmergencyPause);

  // Monitor cross-chain messages
  messenger.on('MessageSent', (sender, recipient, amount, event) => {
    console.log(`Message Sent:
      From: ${sender}
      To: ${recipient}
      Amount: ${ethers.formatEther(amount)} ETH
      Transaction: ${event.transactionHash}
    `);
  });

  // Monitor rate limiting
  rateLimiter.on('RateLimitUpdated', (maxMessages, period) => {
    console.log(`Rate Limit Updated:
      Max Messages: ${maxMessages}
      Period: ${period} seconds
    `);
  });

  // Monitor emergency pauses
  emergencyPause.on('EmergencyPauseTriggered', (reason, duration) => {
    console.log(`Emergency Pause Triggered:
      Reason: ${reason}
      Duration: ${duration} seconds
    `);
  });

  console.log('Monitoring infrastructure set up successfully');
}

setupMonitoring()
  .then(() => console.log('Monitoring started'))
  .catch(error => {
    console.error('Error setting up monitoring:', error);
    process.exit(1);
  });
