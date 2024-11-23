const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Executing emergency withdrawal with account:", deployer.address);

  const network = hre.network.name;
  console.log("Network:", network);

  // Get messenger address from deployment or environment
  const messengerAddress = process.env.MESSENGER_ADDRESS;
  if (!messengerAddress) {
    throw new Error("MESSENGER_ADDRESS not set in environment");
  }


  const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
  const messenger = await CrossChainMessenger.attach(messengerAddress);

  // Get contract balance
  const balance = await ethers.provider.getBalance(messengerAddress);
  console.log("Contract balance:", ethers.utils.formatEther(balance), "ETH");

  console.log("Executing emergency withdrawal...");
  const tx = await messenger.emergencyWithdraw();
  await tx.wait();

  console.log("Emergency withdrawal completed successfully!");

  // Verify the new balance
  const newBalance = await ethers.provider.getBalance(messengerAddress);
  console.log("New contract balance:", ethers.utils.formatEther(newBalance), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
