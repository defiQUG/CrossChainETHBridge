const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment...");

  // Deploy RateLimiter
  const RateLimiter = await hre.ethers.getContractFactory("RateLimiter");
  const rateLimiter = await RateLimiter.deploy(10, 3600); // 10 messages per hour
  await rateLimiter.waitForDeployment();
  console.log("RateLimiter deployed to:", await rateLimiter.getAddress());

  // Deploy EmergencyPause
  const EmergencyPause = await hre.ethers.getContractFactory("EmergencyPause");
  const emergencyPause = await EmergencyPause.deploy(
    ethers.parseEther("100"), // 100 ETH threshold
    3600 // 1 hour pause duration
  );
  await emergencyPause.waitForDeployment();
  console.log("EmergencyPause deployed to:", await emergencyPause.getAddress());

  // Deploy MockRouter for testing
  const MockRouter = await hre.ethers.getContractFactory("TestRouter");
  const mockRouter = await MockRouter.deploy();
  await mockRouter.waitForDeployment();
  console.log("MockRouter deployed to:", await mockRouter.getAddress());

  // Deploy MockWETH
  const MockWETH = await hre.ethers.getContractFactory("MockWETH");
  const mockWETH = await MockWETH.deploy(
    "Wrapped Ether", // Token name
    "WETH"          // Token symbol
  );
  await mockWETH.waitForDeployment();
  console.log("MockWETH deployed to:", await mockWETH.getAddress());

  // Deploy CrossChainMessenger
  const CrossChainMessenger = await hre.ethers.getContractFactory("CrossChainMessenger");
  const messenger = await CrossChainMessenger.deploy(
    await mockRouter.getAddress(),
    await mockWETH.getAddress(),
    await rateLimiter.getAddress(),
    await emergencyPause.getAddress(),
    ethers.parseEther("0.1"), // 0.1 ETH bridge fee
    ethers.parseEther("1") // 1 ETH max fee
  );
  await messenger.waitForDeployment();
  console.log("CrossChainMessenger deployed to:", await messenger.getAddress());

  // Save deployment addresses
  const deployments = {
    RateLimiter: await rateLimiter.getAddress(),
    EmergencyPause: await emergencyPause.getAddress(),
    MockRouter: await mockRouter.getAddress(),
    MockWETH: await mockWETH.getAddress(),
    CrossChainMessenger: await messenger.getAddress()
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    path.join(deploymentsDir, "addresses.json"),
    JSON.stringify(deployments, null, 2)
  );
  console.log("Deployment addresses saved to deployments/addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
