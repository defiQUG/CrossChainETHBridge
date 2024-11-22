const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Helper to run command and pipe output to file
function runCommand(command, args, logFile) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
    });

    const log = fs.createWriteStream(logFile);
    process.stdout.pipe(log);
    process.stderr.pipe(log);

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}

async function main() {
  try {
    console.log('Starting MVP tasks in parallel...');

    // Start local hardhat node
    console.log('Starting Hardhat node...');
    const hardhatNode = spawn('npx', ['hardhat', 'node'], {
      stdio: 'pipe'
    });

    const hardhatLog = fs.createWriteStream('logs/hardhat.log');
    hardhatNode.stdout.pipe(hardhatLog);
    hardhatNode.stderr.pipe(hardhatLog);

    // Wait for node to start
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Deploy contracts
    console.log('Deploying contracts...');
    await runCommand('npx', ['hardhat', 'run', 'scripts/deploy.js', '--network', 'localhost'], 'logs/deploy.log');

    // Get deployed contract address
    const deployLog = fs.readFileSync('logs/deploy.log', 'utf8');
    const addressMatch = deployLog.match(/CrossChainMessenger deployed to: (0x[a-fA-F0-9]{40})/);
    const contractAddress = addressMatch ? addressMatch[1] : '0x0000000000000000000000000000000000000000';

    // Start all tasks in parallel
    console.log('Starting parallel tasks...');

    const tasks = [
      // Run tests
      runCommand('npx', ['hardhat', 'test', '--network', 'localhost'], 'logs/tests.log'),

      // Run coverage
      runCommand('npx', ['hardhat', 'coverage', '--network', 'localhost'], 'logs/coverage.log'),

      // Run gas optimization tests
      runCommand('npx', ['hardhat', 'test', 'test/gas-optimization.test.js', '--network', 'localhost'], 'logs/gas.log'),

      // Start monitoring service
      runCommand('node', ['scripts/monitoring/monitor-service.js'], 'logs/monitor.log', {
        env: {
          ...process.env,
          CONTRACT_ADDRESS: contractAddress,
          RPC_URL: 'http://127.0.0.1:8545'
        }
      }),

      // Start progress tracking
      runCommand('node', ['scripts/track-progress.js'], 'logs/progress.log')
    ];

    // Wait for all tasks to complete
    await Promise.all(tasks);

    console.log('All MVP tasks completed successfully');

    // Clean up
    hardhatNode.kill();

  } catch (error) {
    console.error('Error running MVP tasks:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main };
