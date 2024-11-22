const fs = require('fs');
const path = require('path');

const TASKS = {
    'Smart Contract Core': {
        weight: 0.4,
        files: ['contracts/CrossChainMessenger.sol'],
        logFile: 'logs/tests.log'
    },
    'Testing Framework': {
        weight: 0.3,
        files: ['test/CrossChainMessenger.test.js', 'test/gas-optimization.test.js'],
        logFile: 'logs/coverage.log'
    },
    'Infrastructure': {
        weight: 0.3,
        files: ['scripts/monitoring/monitor-service.js'],
        logFile: 'logs/monitor.log'
    }
};

function calculateProgress() {
    let totalProgress = 0;
    let remainingTime = 0;

    console.log('\n=== MVP Progress Report ===\n');

    for (const [component, config] of Object.entries(TASKS)) {
        let componentProgress = 0;
        let timeEstimate = 0;

        // Check file existence and content
        const fileProgress = config.files.reduce((acc, file) => {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                // Basic heuristic: longer files are considered more complete
                return acc + Math.min(content.length / 1000, 1);
            }
            return acc;
        }, 0) / config.files.length;

        // Check log progress
        let logProgress = 0;
        if (fs.existsSync(config.logFile)) {
            const logContent = fs.readFileSync(config.logFile, 'utf8');
            if (logContent.includes('passing')) {
                logProgress = 1;
            } else if (logContent.includes('running')) {
                logProgress = 0.5;
            }
        }

        componentProgress = (fileProgress * 0.7 + logProgress * 0.3) * 100;
        timeEstimate = Math.ceil((100 - componentProgress) / 2);

        console.log(`${component}:`);
        console.log(`  Progress: ${componentProgress.toFixed(1)}%`);
        console.log(`  Estimated time remaining: ${timeEstimate} minutes\n`);

        totalProgress += componentProgress * config.weight;
        remainingTime = Math.max(remainingTime, timeEstimate);
    }

    console.log('=== Overall Progress ===');
    console.log(`Total Progress: ${totalProgress.toFixed(2)}%`);
    console.log(`Estimated time to completion: ${remainingTime} minutes\n`);

    return { totalProgress, remainingTime };
}

// Run progress calculation
const { totalProgress, remainingTime } = calculateProgress();

// Write progress to file for other processes
fs.writeFileSync('progress.json', JSON.stringify({
    totalProgress,
    remainingTime,
    lastUpdate: new Date().toISOString()
}));

// Monitor progress every 30 seconds
setInterval(calculateProgress, 30000);
