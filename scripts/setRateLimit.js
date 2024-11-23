const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Setting rate limit with account:", deployer.address);

  const network = hre.network.name;
  console.log("Network:", network);

  // Get messenger address from deployment or environment
  const messengerAddress = process.env.MESSENGER_ADDRESS;
  if (!messengerAddress) {
    throw new Error("MESSENGER_ADDRESS not set in environment");
  }

  // Get rate limit parameters from environment or use defaults
  const maxMessages = process.env.MAX_MESSAGES_PER_PERIOD || 5;
  const periodDuration = process.env.PERIOD_DURATION || 3600; // 1 hour in seconds

  const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
  const messenger = await CrossChainMessenger.attach(messengerAddress);

  console.log(`Setting rate limit to ${maxMessages} messages per ${periodDuration} seconds...`);
  const tx = await messenger.setRateLimit(maxMessages, periodDuration);
  await tx.wait();

  console.log("Rate limit set successfully!");

  // Verify the new settings
  const currentLimit = await messenger.maxMessagesPerPeriod();
  const currentPeriod = await messenger.periodDuration();
  console.log("Current rate limit:", currentLimit.toString(), "messages per", currentPeriod.toString(), "seconds");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
