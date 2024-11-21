const hre = require("hardhat");

async function main() {
  console.log("Deploying CrossChainMessenger contract...");

  // Get the router address based on the network
  const getRouterAddress = (networkName) => {
    // TODO: Replace with actual CCIP router addresses for each network
    const routerAddresses = {
      defiOracleMeta: "0x0000000000000000000000000000000000000000", // Replace with actual router
      polygon: "0x0000000000000000000000000000000000000000", // Replace with actual router
      hardhat: "0x0000000000000000000000000000000000000000"
    };
    return routerAddresses[networkName];
  };

  const network = await hre.ethers.provider.getNetwork();
  const networkName = network.name;
  const routerAddress = getRouterAddress(networkName);

  const CrossChainMessenger = await hre.ethers.getContractFactory("CrossChainMessenger");
  const messenger = await CrossChainMessenger.deploy(routerAddress);

  await messenger.deployed();

  console.log(`CrossChainMessenger deployed to: ${messenger.address}`);
  console.log(`Network: ${networkName}`);
  console.log(`Router Address: ${routerAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
