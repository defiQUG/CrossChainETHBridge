module.exports = {
  apps: [
    {
      name: 'hardhat-node',
      script: 'npx',
      args: 'hardhat node',
      autorestart: true,
      max_memory_restart: '1G'
    },
    {
      name: 'tests',
      script: 'npx',
      args: 'hardhat test',
      env: {
        NODE_OPTIONS: '--max-old-space-size=4096'
      },
      autorestart: false
    },
    {
      name: 'coverage',
      script: 'npx',
      args: 'hardhat coverage',
      env: {
        NODE_OPTIONS: '--max-old-space-size=4096'
      },
      autorestart: false
    },
    {
      name: 'gas-optimization',
      script: 'npx',
      args: 'hardhat test test/gas-optimization.test.js',
      env: {
        NODE_OPTIONS: '--max-old-space-size=4096'
      },
      autorestart: false
    },
    {
      name: 'monitor',
      script: 'scripts/monitoring/monitor-service.js',
      env: {
        CONTRACT_ADDRESS: '0x0000000000000000000000000000000000000000',
        RPC_URL: 'http://127.0.0.1:8545'
      },
      autorestart: true
    },
    {
      name: 'progress',
      script: 'scripts/track-progress.js',
      autorestart: true
    }
  ]
};
