const hre = require("hardhat");

async function getRouterAddress(networkName) {
  // Official Chainlink CCIP Router addresses
  const routerAddresses = {
    defiOracleMeta: "0xD0daae2231E9CB96b94C8512223533293C3693Bf", // Defi Oracle Meta CCIP Router
    polygon: "0x70499c328e1E2a3c41108bd3730F6670a44595D1", // Polygon CCIP Router
    hardhat: "0x0000000000000000000000000000000000000000" // Local testing
  };

  const routerAddress = routerAddresses[networkName];
  if (!routerAddress) {
    throw new Error(`No router address configured for network: ${networkName}`);
  }

  return routerAddress;
}

async function verifyContract(address, constructorArgs) {
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying contract...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: constructorArgs,
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.warn("Contract verification failed:", error.message);
    }
  }
}

async function main() {
  try {
    console.log("Starting deployment process...");

    // Get network information
    const network = await hre.ethers.provider.getNetwork();
    const networkName = network.name;
    console.log(`Deploying to network: ${networkName}`);

    // Validate network
    if (!["defiOracleMeta", "polygon", "hardhat"].includes(networkName)) {
      throw new Error(`Unsupported network: ${networkName}`);
    }

    // Get router address
    const routerAddress = await getRouterAddress(networkName);
    console.log(`Using CCIP Router address: ${routerAddress}`);

    // Deploy contract
    console.log("Deploying CrossChainMessenger contract...");
    const CrossChainMessenger = await hre.ethers.getContractFactory("CrossChainMessenger");
    const messenger = await CrossChainMessenger.deploy(routerAddress);

    await messenger.deployed();
    console.log(`CrossChainMessenger deployed to: ${messenger.address}`);

    // Verify contract if not on local network
    if (networkName !== "hardhat") {
      await verifyContract(messenger.address, [routerAddress]);
    }

    // Log deployment information
    const deploymentInfo = {
      network: networkName,
      address: messenger.address,
      router: routerAddress,
      timestamp: new Date().toISOString()
    };
    console.log("Deployment successful:", deploymentInfo);

    return deploymentInfo;
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main, getRouterAddress };
