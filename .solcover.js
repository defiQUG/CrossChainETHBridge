module.exports = {
    skipFiles: ['mocks/'],
    configureYulOptimizer: true,
    solcOptimizerDetails: {
        peephole: false,
        jumpdestRemover: false,
        orderLiterals: false,
        deduplicate: false,
        cse: false,
        constantOptimizer: false,
        yul: false
    },
    mocha: {
        timeout: 100000
    }
};
