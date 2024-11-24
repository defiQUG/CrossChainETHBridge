// Import ethers directly instead of from hardhat
const ethers = require("ethers");
const path = require('path');

// Alert configuration
const ALERTS_DIR = path.join(__dirname, '../../../logs/alerts');

const ALERT_THRESHOLDS = {
    processingTime: 3600, // 1 hour in seconds
    pendingMessages: 100,  // Maximum number of pending messages
    failureRate: 0.05,    // 5% failure rate threshold
    highValue: ethers.utils.parseEther("10.0") // 10 ETH threshold
};

module.exports = {
    ALERTS_DIR,
    ALERT_THRESHOLDS
};
