const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment pipeline...");

  // Deploy contracts
  console.log("Deploying contracts...");

  const MockRouter = await hre.ethers.getContractFactory("MockRouter");
  const router = await MockRouter.deploy();
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  console.log("MockRouter deployed to:", routerAddress);

  const MockWETH = await hre.ethers.getContractFactory("MockWETH");
  const weth = await MockWETH.deploy("Wrapped Ether", "WETH");
  await weth.waitForDeployment();
  const wethAddress = await weth.getAddress();
  console.log("MockWETH deployed to:", wethAddress);

  const CrossChainMessenger = await hre.ethers.getContractFactory("CrossChainMessenger");
  const messenger = await CrossChainMessenger.deploy(routerAddress, wethAddress, 5);
  await messenger.waitForDeployment();
  const messengerAddress = await messenger.getAddress();
  console.log("CrossChainMessenger deployed to:", messengerAddress);

  // Save deployment addresses
  const deployments = {
    router: routerAddress,
    weth: wethAddress,
    messenger: messengerAddress,
    timestamp: new Date().toISOString(),
    network: hre.network.name
  };

  const deploymentsDir = path.join(__dirname, "../../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(deployments, null, 2)
  );

  // Verify contracts
  console.log("\nVerifying contracts...");

  try {
    await hre.run("verify:verify", {
      address: messengerAddress,
      constructorArguments: [routerAddress, wethAddress, 5]
    });
    console.log("CrossChainMessenger verified successfully");
  } catch (error) {
    console.error("Error verifying CrossChainMessenger:", error);
  }

  try {
    await hre.run("verify:verify", {
      address: routerAddress,
      constructorArguments: []
    });
    console.log("MockRouter verified successfully");
  } catch (error) {
    console.error("Error verifying MockRouter:", error);
  }

  try {
    await hre.run("verify:verify", {
      address: wethAddress,
      constructorArguments: ["Wrapped Ether", "WETH"]
    });
    console.log("MockWETH verified successfully");
  } catch (error) {
    console.error("Error verifying MockWETH:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
