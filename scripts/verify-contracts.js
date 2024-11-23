const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting contract verification...");

  const deploymentPath = path.join(__dirname, "deployments/addresses.json");
  if (!fs.existsSync(deploymentPath)) {
    throw new Error("Deployment addresses file not found. Please run deployment first.");
  }

  const addresses = JSON.parse(fs.readFileSync(deploymentPath));

  // Verify RateLimiter
  console.log("Verifying RateLimiter...");
  await hre.run("verify:verify", {
    address: addresses.RateLimiter,
    constructorArguments: [10, 3600],
  });

  // Verify EmergencyPause
  console.log("Verifying EmergencyPause...");
  await hre.run("verify:verify", {
    address: addresses.EmergencyPause,
    constructorArguments: [
      ethers.parseEther("100"),
      3600
    ],
  });

  // Verify MockWETH
  console.log("Verifying MockWETH...");
  await hre.run("verify:verify", {
    address: addresses.MockWETH,
    constructorArguments: ["Wrapped Ether", "WETH"],
  });

  // Verify CrossChainMessenger
  console.log("Verifying CrossChainMessenger...");
  await hre.run("verify:verify", {
    address: addresses.CrossChainMessenger,
    constructorArguments: [
      addresses.MockRouter,
      addresses.MockWETH,
      addresses.RateLimiter,
      addresses.EmergencyPause,
      ethers.parseEther("0.1"),
      ethers.parseEther("1")
    ],
  });

  console.log("Contract verification completed successfully");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
