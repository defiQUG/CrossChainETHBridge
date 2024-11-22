const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Ensure logs directory exists
!fs.existsSync('logs') && fs.mkdirSync('logs');

// Helper to create a promise that rejects after a timeout
const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));

// Helper to run command with timeout
async function runCommandWithTimeout(command, args, logFile, timeoutMs = 300000, env = {}) {
  return Promise.race([
    new Promise((resolve, reject) => {
      const childProcess = spawn(command, args, {
        env: { ...process.env, ...env, NODE_OPTIONS: '--max-old-space-size=4096' }
      });

      const log = fs.createWriteStream(logFile);
      childProcess.stdout.pipe(log);
      childProcess.stderr.pipe(log);

      childProcess.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Process exited with code ${code}`));
      });

      childProcess.on('error', reject);
    }),
    timeout(timeoutMs)
  ]);
}

// Helper to verify hardhat node is running
async function verifyHardhatNode() {
  try {
    const response = await fetch('http://127.0.0.1:8545', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    });
    const data = await response.json();
    return data.result !== undefined;
  } catch (error) {
    return false;
  }
}

async function main() {
  try {
    console.log('Starting MVP tasks...');

    // Kill any existing processes
    console.log('Cleaning up existing processes...');
    spawn('pkill', ['-f', 'hardhat']);
    spawn('pkill', ['-f', 'node']);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Start hardhat node
    console.log('Starting Hardhat node...');
    const hardhatNode = spawn('npx', ['hardhat', 'node'], { stdio: 'pipe' });
    const hardhatLog = fs.createWriteStream('logs/hardhat.log');
    hardhatNode.stdout.pipe(hardhatLog);
    hardhatNode.stderr.pipe(hardhatLog);

    // Wait for node to start and verify
    console.log('Waiting for Hardhat node to start...');
    let nodeRunning = false;
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (await verifyHardhatNode()) {
        nodeRunning = true;
        break;
      }
    }

    if (!nodeRunning) {
      throw new Error('Failed to start Hardhat node');
    }

    console.log('Deploying contracts...');
    await runCommandWithTimeout('npx', ['hardhat', 'run', 'scripts/deploy.js', '--network', 'localhost'], 'logs/deploy.log');

    console.log('Starting parallel tasks...');
    await Promise.all([
      runCommandWithTimeout('npx', ['hardhat', 'test', '--network', 'localhost'], 'logs/tests.log'),
      runCommandWithTimeout('npx', ['hardhat', 'coverage', '--network', 'localhost'], 'logs/coverage.log'),
      runCommandWithTimeout('npx', ['hardhat', 'test', 'test/gas-optimization.test.js', '--network', 'localhost'], 'logs/gas.log'),
      runCommandWithTimeout('node', ['scripts/monitoring/monitor-service.js'], 'logs/monitor.log', 300000, {
        CONTRACT_ADDRESS: '0x0000000000000000000000000000000000000000',
        RPC_URL: 'http://127.0.0.1:8545'
      }),
      runCommandWithTimeout('node', ['scripts/track-progress.js'], 'logs/progress.log')
    ]);

    console.log('All MVP tasks completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running MVP tasks:', error);
    process.exit(1);
  }
}

// Run main function
main().catch(console.error);
