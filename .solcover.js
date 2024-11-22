module.exports = {
    skipFiles: [],
    configureYulOptimizer: true,
    mocha: {
        timeout: 100000
    },
    providerOptions: {
        default_balance_ether: 100,
        total_accounts: 20,
    },
    measureStatementCoverage: true,
    measureFunctionCoverage: true,
    measureBranchCoverage: true,
    measureModifierCoverage: true,
    measureLineCoverage: true,
    // Force coverage to run with hardhat network
    network: {
        url: 'http://localhost:8545'
    }
};
