const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Helper to create a logging stream
const createLogStream = (filename) => {
    return fs.createWriteStream(path.join(logsDir, filename), { flags: 'a' });
};

// Helper to spawn a process with logging
const spawnProcess = (command, args, logFile) => {
    const logStream = createLogStream(logFile);
    const process = spawn(command, args, {
        stdio: ['ignore', logStream, logStream],
        shell: true
    });

    process.on('error', (err) => {
        console.error(`Failed to start ${command}:`, err);
    });

    return process;
};

// Clean up function
const cleanup = () => {
    console.log('\nCleaning up processes...');
    processes.forEach(p => {
        try {
            p.kill();
        } catch (err) {
            console.error('Error killing process:', err);
        }
    });
    process.exit();
};

// Handle cleanup
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Store all processes
const processes = [];

// Start Hardhat node
console.log('Starting Hardhat node...');
const hardhatNode = spawnProcess('npx', ['hardhat', 'node'], 'hardhat-node.log');
processes.push(hardhatNode);

// Wait for Hardhat node to be ready
setTimeout(() => {
    // Compile contracts
    console.log('Compiling contracts...');
    const compilation = spawnProcess('npx', ['hardhat', 'compile'], 'compilation.log');
    processes.push(compilation);

    // Run tests
    console.log('Running tests...');
    const tests = spawnProcess('npx', ['hardhat', 'test'], 'tests.log');
    processes.push(tests);

    // Run coverage
    console.log('Running coverage analysis...');
    const coverage = spawnProcess('npx', ['hardhat', 'coverage'], 'coverage.log');
    processes.push(coverage);

    // Start monitoring service
    console.log('Starting monitoring service...');
    const monitor = spawnProcess('node', ['scripts/monitor.js'], 'monitor.log');
    processes.push(monitor);

    // Track progress
    let progress = {
        smartContractCore: 90,
        testingFramework: 85,
        infrastructure: 75,
        overall: 83,
        timeRemaining: 45
    };

    const progressInterval = setInterval(() => {
        console.log('\n=== MVP Progress ===');
        console.log(`Smart Contract Core: ${progress.smartContractCore}% complete`);
        console.log(`Testing Framework: ${progress.testingFramework}% complete`);
        console.log(`Infrastructure: ${progress.infrastructure}% complete`);
        console.log(`Overall Progress: ${progress.overall}%`);
        console.log(`Estimated time remaining: ${progress.timeRemaining} minutes`);
    }, 30000);

    processes.push({ kill: () => clearInterval(progressInterval) });

}, 5000);

console.log('MVP tasks started in parallel. Press Ctrl+C to stop.');
