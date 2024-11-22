const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  try {
    const deployment = JSON.parse(fs.readFileSync('./deployments/localhost/CrossChainMessenger.json', 'utf8'));
    const messengerAddress = deployment.address;

    console.log("Setting up alerts for contract:", messengerAddress);
    const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
    const messenger = CrossChainMessenger.attach(messengerAddress);

    // Monitor critical events
    messenger.on("MessageSent", (messageId, from, to, amount) => {
      console.log(`ALERT: Message Sent - ID: ${messageId}, From: ${from}, To: ${to}, Amount: ${amount}`);
      checkThresholds(amount);
    });

    messenger.on("MessageReceived", (messageId, from, to, amount) => {
      console.log(`ALERT: Message Received - ID: ${messageId}, From: ${from}, To: ${to}, Amount: ${amount}`);
      checkThresholds(amount);
    });

    messenger.on("Paused", () => {
      console.log("CRITICAL ALERT: Contract has been paused!");
    });

    messenger.on("Unpaused", () => {
      console.log("INFO: Contract has been unpaused");
    });

    function checkThresholds(amount) {
      const threshold = ethers.utils.parseEther("10.0");
      if (amount.gt(threshold)) {
        console.log("HIGH VALUE ALERT: Transfer amount exceeds 10 ETH threshold!");
      }
    }

    console.log("Alert system initialized successfully");
  } catch (error) {
    console.error("Error in alert system:", error);
    process.exit(1);
  }
}

main();
