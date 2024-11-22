const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    logDir: './logs',
    alertThresholds: {
        pendingMessages: 100,
        processingTime: 3600, // 1 hour in seconds
        failedMessages: 5
    }
};

// Ensure log directory exists
if (!fs.existsSync(CONFIG.logDir)) {
    fs.mkdirSync(CONFIG.logDir, { recursive: true });
}

async function monitorCrossChainMessages(contract, networks) {
    console.log("Starting cross-chain message monitoring...");

    const logFile = path.join(CONFIG.logDir, `bridge_monitor_${Date.now()}.log`);
    const pendingMessages = new Map();

    // Monitor BridgeInitiated events
    contract.on("BridgeInitiated", async (sender, amount, destinationChainSelector, event) => {
        const {timestamp} = await event.getBlock();
        const messageId = `${event.transactionHash}-${event.logIndex}`;

        pendingMessages.set(messageId, {
            sender,
            amount: amount.toString(),
            destinationChain: destinationChainSelector,
            timestamp
        });

        logEvent("BridgeInitiated", {
            messageId,
            sender,
            amount: amount.toString(),
            destinationChain: destinationChainSelector,
            timestamp
        });

        // Alert if too many pending messages
        if (pendingMessages.size > CONFIG.alertThresholds.pendingMessages) {
            alert("High number of pending messages detected!");
        }
    });

    // Monitor BridgeCompleted events
    contract.on("BridgeCompleted", async (receiver, amount, event) => {
        const timestamp = (await event.getBlock()).timestamp;

        logEvent("BridgeCompleted", {
            receiver,
            amount: amount.toString(),
            timestamp
        });

        // Check processing time for completed messages
        for (const [messageId, message] of pendingMessages.entries()) {
            if (message.amount === amount.toString()) {
                const processingTime = timestamp - message.timestamp;
                if (processingTime > CONFIG.alertThresholds.processingTime) {
                    alert(`Long processing time detected: ${processingTime} seconds`);
                }
                pendingMessages.delete(messageId);
                break;
            }
        }
    });

    function logEvent(eventType, data) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            eventType,
            ...data
        };
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    }

    function alert(message) {
        const alertEntry = {
            timestamp: new Date().toISOString(),
            type: 'ALERT',
            message
        };
        fs.appendFileSync(logFile, JSON.stringify(alertEntry) + '\n');
        console.error(`ALERT: ${message}`);
    }
}

async function main() {
    const networks = {
        defiOracleMeta: {
            chainId: 138,
            rpc: process.env.DEFI_ORACLE_META_RPC_URL
        },
        polygon: {
            chainId: 137,
            rpc: process.env.POLYGON_RPC_URL
        }
    };

    try {
        const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
        const contract = await CrossChainMessenger.attach(process.env.MESSENGER_ADDRESS);

        await monitorCrossChainMessages(contract, networks);
        console.log("Monitoring service started successfully");
    } catch (error) {
        console.error("Error starting monitoring service:", error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { monitorCrossChainMessages };
