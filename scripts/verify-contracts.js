const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function verifyContract(name, address, constructorArguments) {
  console.log(`Verifying ${name} at ${address}...`);
  try {
    await hre.run('verify:verify', {
      address: address,
      constructorArguments: constructorArguments
    });
    console.log(`✅ ${name} verified successfully`);
  } catch (error) {
    if (error.message.includes('Already Verified')) {
      console.log(`ℹ️  ${name} is already verified`);
    } else {
      console.error(`❌ Failed to verify ${name}:`, error);
      throw error;
    }
  }
}

async function main() {
  console.log('Starting contract verification process...');

  // Load deployment addresses
  const deploymentPath = path.join(__dirname, '../deployments/addresses.json');
  if (!fs.existsSync(deploymentPath)) {
    throw new Error('Deployment addresses file not found. Please run deployment first.');
  }

  const addresses = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

  // Verify MockRouter
  if (addresses.mockRouter) {
    await verifyContract('MockRouter', addresses.mockRouter, []);
  }

  // Verify MockWETH
  if (addresses.mockWeth) {
    await verifyContract('MockWETH', addresses.mockWeth, [
      "Wrapped Ether",
      "WETH"
    ]);
  }

  // Verify RateLimiter
  if (addresses.rateLimiter) {
    await verifyContract('RateLimiter', addresses.rateLimiter, [
      process.env.MAX_MESSAGES_PER_PERIOD,
      process.env.PERIOD_LENGTH
    ]);
  }

  // Verify EmergencyPause
  if (addresses.emergencyPause) {
    await verifyContract('EmergencyPause', addresses.emergencyPause, [
      process.env.PAUSE_THRESHOLD,
      process.env.PAUSE_DURATION
    ]);
  }

  // Verify CrossChainMessenger
  if (addresses.crossChainMessenger) {
    await verifyContract('CrossChainMessenger', addresses.crossChainMessenger, [
      addresses.mockRouter,
      addresses.mockWeth,
      process.env.BRIDGE_FEE,
      process.env.MAX_FEE,
      process.env.MAX_MESSAGES_PER_PERIOD,
      process.env.PAUSE_THRESHOLD,
      process.env.PAUSE_DURATION
    ]);
  }

  console.log('✨ All contracts verified successfully');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
