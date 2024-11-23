const { spawn } = require('child_process');
const { writeFileSync, createWriteStream } = require('fs');
const { join } = require('path');

// Create a process and pipe its output to a log file
function spawnProcess(command, args, logFile, env = {}) {
  const process = spawn(command, args, {
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  const log = createWriteStream(logFile);
  process.stdout.pipe(log);
  process.stderr.pipe(log);

  return process;
}

async function main() {
  try {
    console.log('Starting MVP tasks...');

    // Kill any existing processes
    spawn('pkill', ['-f', 'hardhat']);
    spawn('pkill', ['-f', 'node']);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Start hardhat node
    console.log('Starting Hardhat node...');
    const hardhatNode = spawnProcess('npx', ['hardhat', 'node'], 'logs/hardhat.log');

    // Wait for node to start
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Run tests (without network flag)
    console.log('Running tests...');
    const testProcess = spawnProcess(
      'npx',
      ['hardhat', 'test'],
      'logs/tests.log',
      { NODE_OPTIONS: '--max-old-space-size=4096' }
    );

    // Run coverage (without network flag)
    console.log('Running coverage...');
    const coverageProcess = spawnProcess(
      'npx',
      ['hardhat', 'coverage'],
      'logs/coverage.log',
      { NODE_OPTIONS: '--max-old-space-size=4096' }
    );

    // Run gas optimization tests
    console.log('Running gas optimization tests...');
    const gasProcess = spawnProcess(
      'npx',
      ['hardhat', 'test', 'test/gas-optimization.test.js'],
      'logs/gas.log',
      { NODE_OPTIONS: '--max-old-space-size=4096' }
    );

    // Start monitoring service
    console.log('Starting monitoring service...');
    const monitorProcess = spawnProcess(
      'node',
      ['scripts/monitoring/monitor-service.js'],
      'logs/monitor.log',
      {
        CONTRACT_ADDRESS: '0x0000000000000000000000000000000000000000',
        RPC_URL: 'http://127.0.0.1:8545'
      }
    );

    // Start progress tracking
    console.log('Starting progress tracking...');
    const progressProcess = spawnProcess(
      'node',
      ['scripts/track-progress.js'],
      'logs/progress.log'
    );

    // Monitor all processes
    const processes = {
      hardhat: hardhatNode,
      test: testProcess,
      coverage: coverageProcess,
      gas: gasProcess,
      monitor: monitorProcess,
      progress: progressProcess
    };

    Object.entries(processes).forEach(([name, process]) => {
      process.on('exit', (code) => {
        console.log(`${name} process exited with code ${code}`);
      });
    });

    // Keep the script running
    process.on('SIGINT', () => {
      console.log('Cleaning up processes...');
      Object.values(processes).forEach(p => p.kill());
      process.exit(0);
    });

    // Log status every 30 seconds
    setInterval(() => {
      console.log('\n=== MVP Task Status ===');
      Object.entries(processes).forEach(([name, process]) => {
        console.log(`${name}: ${process.killed ? 'stopped' : 'running'}`);
      });
    }, 30000);

  } catch (error) {
    console.error('Error running MVP tasks:', error);
    process.exit(1);
  }
}

main().catch(console.error);
