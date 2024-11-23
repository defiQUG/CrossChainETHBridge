const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function verifyContract(address, constructorArguments, contract = '') {
  console.log(`Verifying contract at ${address}...`);
  try {
    const verifyArgs = {
      address: address,
      constructorArguments: constructorArguments
    };

    if (contract) {
      verifyArgs.contract = contract;
    }

    await hre.run("verify:verify", verifyArgs);
    console.log("Contract verified successfully!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("Contract is already verified");
    } else {
      console.error("Verification error:", error);
      throw error;
    }
  }
}

async function main() {
  // Load deployment addresses
  const deploymentPath = path.join(__dirname, '../deployments', hre.network.name + '.json');
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`No deployment found for network ${hre.network.name}`);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

  // Verify WETH
  if (deployment.weth) {
    await verifyContract(
      deployment.weth,
      ["Wrapped Ether", "WETH"],
      "contracts/mocks/MockWETH.sol:MockWETH"
    );
  }

  // Verify CrossChainMessenger
  if (deployment.messenger) {
    await verifyContract(
      deployment.messenger,
      [
        deployment.router,
        deployment.weth,
        process.env.MAX_MESSAGES_PER_PERIOD || "5"
      ],
      "contracts/CrossChainMessenger.sol:CrossChainMessenger"
    );
  }
}

// Handle Node.js 20.x unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
