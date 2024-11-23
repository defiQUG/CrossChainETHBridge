const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Setting bridge fee with account:", deployer.address);

  const network = hre.network.name;
  console.log("Network:", network);

  // Get messenger address from deployment or environment
  const messengerAddress = process.env.MESSENGER_ADDRESS;
  if (!messengerAddress) {
    throw new Error("MESSENGER_ADDRESS not set in environment");
  }

  // Get fee amount from environment or use default
  const bridgeFee = process.env.INITIAL_BRIDGE_FEE || ethers.utils.parseEther("0.0001");

  const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
  const messenger = await CrossChainMessenger.attach(messengerAddress);

  console.log(`Setting bridge fee to ${bridgeFee} wei...`);
  const tx = await messenger.setBridgeFee(bridgeFee);
  await tx.wait();

  console.log("Bridge fee set successfully!");

  // Verify the new fee
  const newFee = await messenger.bridgeFee();
  console.log("Current bridge fee:", newFee.toString(), "wei");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
