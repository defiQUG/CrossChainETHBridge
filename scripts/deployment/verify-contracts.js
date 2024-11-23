const hre = require("hardhat");

async function main() {
  console.log("Starting contract verification...");

  const contracts = [
    {
      name: "CrossChainMessenger",
      address: process.env.MESSENGER_ADDRESS,
      constructorArguments: [
        process.env.ROUTER_ADDRESS,
        process.env.WETH_ADDRESS,
        process.env.MAX_MESSAGES
      ]
    },
    {
      name: "MockRouter",
      address: process.env.ROUTER_ADDRESS,
      constructorArguments: []
    },
    {
      name: "MockWETH",
      address: process.env.WETH_ADDRESS,
      constructorArguments: ["Wrapped Ether", "WETH"]
    }
  ];

  for (const contract of contracts) {
    try {
      await hre.run("verify:verify", {
        address: contract.address,
        constructorArguments: contract.constructorArguments,
      });
      console.log(`${contract.name} verified successfully`);
    } catch (error) {
      console.error(`Error verifying ${contract.name}:`, error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
