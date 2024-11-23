const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Executing pause with account:", deployer.address);

  const network = hre.network.name;
  console.log("Network:", network);

  // Get messenger address from deployment or environment
  const messengerAddress = process.env.MESSENGER_ADDRESS;
  if (!messengerAddress) {
    throw new Error("MESSENGER_ADDRESS not set in environment");
  }

  const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
  const messenger = await CrossChainMessenger.attach(messengerAddress);

  console.log("Pausing CrossChainMessenger...");
  const tx = await messenger.pause();
  await tx.wait();

  console.log("Contract paused successfully!");

  // Verify the pause state
  const isPaused = await messenger.paused();
  console.log("Contract paused state:", isPaused);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
