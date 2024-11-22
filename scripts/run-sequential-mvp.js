const { spawn } = require('child_process');
const { writeFileSync } = require('fs');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

async function runCommand(command, args = [], env = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    const proc = spawn(command, args, {
      env: { ...process.env, ...env },
      stdio: 'inherit'
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function main() {
  try {
    console.log('Starting sequential MVP tasks...');

    // Start Hardhat node
    const hardhatNode = spawn('npx', ['hardhat', 'node'], {
      stdio: 'inherit'
    });

    // Wait for node to start
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Run tests
    console.log('\n=== Running Tests ===');
    await runCommand('npx', ['hardhat', 'test'], {
      NODE_OPTIONS: '--max-old-space-size=4096'
    });

    // Run coverage
    console.log('\n=== Running Coverage ===');
    await runCommand('npx', ['hardhat', 'coverage'], {
      NODE_OPTIONS: '--max-old-space-size=4096'
    });

    // Run gas optimization tests
    console.log('\n=== Running Gas Optimization Tests ===');
    await runCommand('npx', ['hardhat', 'test', 'test/gas-optimization.test.js'], {
      NODE_OPTIONS: '--max-old-space-size=4096'
    });

    // Update progress
    const progress = {
      totalProgress: 75,
      remainingTime: 15,
      lastUpdate: new Date().toISOString()
    };
    writeFileSync('progress.json', JSON.stringify(progress, null, 2));

    console.log('\n=== MVP Tasks Completed Successfully ===');
    hardhatNode.kill();

  } catch (error) {
    console.error('Error running MVP tasks:', error);
    process.exit(1);
  }
}

main().catch(console.error);
