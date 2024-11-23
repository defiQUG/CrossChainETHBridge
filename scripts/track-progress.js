const fs = require('fs');
const path = require('path');

function calculateProgress() {
  const progress = {
    smartContract: 0,
    testing: 0,
    infrastructure: 0,
    documentation: 0
  };

  try {
    // Check test coverage
    if (fs.existsSync('coverage/index.html')) {
      const coverage = fs.readFileSync('coverage/index.html', 'utf8');
      const match = coverage.match(/(\d+(\.\d+)?%)/);
      if (match) {
        progress.testing = parseFloat(match[1]) || 0;
      }
    }

    // Check smart contract implementation
    const contractFiles = ['contracts/CrossChainMessenger.sol', 'contracts/mocks/MockRouter.sol', 'contracts/mocks/MockWETH.sol'];
    const contractsExist = contractFiles.every(file => fs.existsSync(file));
    if (contractsExist) {
      progress.smartContract = 75; // Base implementation complete
    }

    // Check infrastructure setup
    const infraFiles = ['scripts/monitoring/monitor-service.js', 'scripts/monitoring/config.js'];
    const infraExists = infraFiles.every(file => fs.existsSync(file));
    if (infraExists) {
      progress.infrastructure = 60; // Monitoring setup complete
    }

    // Check documentation
    const docFiles = ['README.md', 'DEPLOYMENT_CHECKLIST.md'];
    const docsExist = docFiles.every(file => fs.existsSync(file));
    if (docsExist) {
      progress.documentation = 40; // Basic documentation complete
    }

    // Calculate overall progress
    const weights = { smartContract: 0.4, testing: 0.3, infrastructure: 0.2, documentation: 0.1 };
    const totalProgress = Object.keys(progress).reduce((sum, key) => {
      return sum + (progress[key] * weights[key]);
    }, 0);

    // Estimate remaining time based on progress
    const remainingTime = Math.ceil((100 - totalProgress) * 0.5); // 0.5 minutes per percentage point

    return {
      totalProgress: parseFloat(totalProgress.toFixed(1)),
      remainingTime,
      lastUpdate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error calculating progress:', error);
    return { totalProgress: 0, remainingTime: 0, lastUpdate: new Date().toISOString() };
  }
}

function updateProgress() {
  const progress = calculateProgress();
  fs.writeFileSync('progress.json', JSON.stringify(progress, null, 2));
  return progress;
}

// Update progress every 30 seconds
setInterval(updateProgress, 30000);

// Initial update
const initialProgress = updateProgress();
console.log('Initial progress:', initialProgress);

module.exports = { calculateProgress, updateProgress };
