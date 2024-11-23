const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  try {
    // Get deployed contract addresses from deployment artifacts
    const deploymentPath = './deployments/localhost/CrossChainMessenger.json';
    if (!fs.existsSync(deploymentPath)) {
      console.log("Deployment artifacts not found. Running deployment...");
      const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
      // Deploy with constructor arguments for router, WETH, and chain ID
      const [deployer] = await ethers.getSigners();
      const MockRouter = await ethers.getContractFactory("MockRouter");
      const router = await MockRouter.deploy();
      await router.deployed();

      const MockWETH = await ethers.getContractFactory("MockWETH");
      const weth = await MockWETH.deploy("Wrapped Ether", "WETH");
      await weth.deployed();

      const messenger = await CrossChainMessenger.deploy(
        router.address,
        weth.address,
        137 // Polygon PoS Chain ID
      );
      await messenger.deployed();
      console.log("CrossChainMessenger deployed to:", messenger.address);

      // Save deployment info
      if (!fs.existsSync('./deployments/localhost')) {
        fs.mkdirSync('./deployments/localhost', { recursive: true });
      }
      fs.writeFileSync(deploymentPath, JSON.stringify({
        address: messenger.address,
        router: router.address,
        weth: weth.address
      }, null, 2));
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    const messengerAddress = deployment.address;

    console.log("Monitoring contract at:", messengerAddress);
    const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
    const messenger = CrossChainMessenger.attach(messengerAddress);

    // Monitor events
    messenger.on("MessageSent", (from, to, amount, event) => {
      console.log(`Message Sent: ${from} -> ${to}, Amount: ${amount}`);
    });

    messenger.on("MessageReceived", (from, to, amount, event) => {
      console.log(`Message Received: ${from} -> ${to}, Amount: ${amount}`);
    });

    console.log("Monitoring started successfully");
  } catch (error) {
    console.error("Error in monitor service:", error);
    process.exit(1);
  }
}

main();
