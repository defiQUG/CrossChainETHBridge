# CrossChainETHBridge Deployment Guide

## Prerequisites

### Environment Setup
1. Node.js 20.x (required for deployment scripts)
```bash
nvm install 20
nvm use 20
```

2. Package Installation
```bash
pnpm install
```

3. Environment Variables
Create a `.env` file with the following variables:
```
# Network RPCs
DEFI_ORACLE_META_RPC=<Defi Oracle Meta RPC URL>
POLYGON_RPC=<Polygon RPC URL>

# Private Keys (DO NOT SHARE)
DEPLOYER_PRIVATE_KEY=<Deployer Wallet Private Key>

# API Keys
POLYGONSCAN_API_KEY=<PolygonScan API Key>
DEFI_ORACLE_SCAN_API_KEY=<Defi Oracle Explorer API Key>

# Contract Parameters
MAX_MESSAGES_PER_PERIOD=5
INITIAL_BRIDGE_FEE=100000000000000 # 0.0001 ETH
```

## Deployment Steps

### 1. Compile Contracts
```bash
HARDHAT_IGNORE_NODE_VERSION=true pnpm hardhat compile
```

### 2. Deploy to Defi Oracle Meta Mainnet (Chain ID 138)

1. Deploy WETH Contract
```bash
HARDHAT_IGNORE_NODE_VERSION=true pnpm hardhat run scripts/deploy.js --network defiOracleMeta
```

2. Verify WETH Contract
```bash
HARDHAT_IGNORE_NODE_VERSION=true pnpm hardhat verify --network defiOracleMeta <WETH_ADDRESS> "Wrapped Ether" "WETH"
```

3. Deploy CrossChainMessenger
```bash
HARDHAT_IGNORE_NODE_VERSION=true pnpm hardhat run scripts/deploy.js --network defiOracleMeta --router <CCIP_ROUTER_ADDRESS> --weth <WETH_ADDRESS>
```

4. Verify CrossChainMessenger
```bash
HARDHAT_IGNORE_NODE_VERSION=true pnpm hardhat verify --network defiOracleMeta <MESSENGER_ADDRESS> <ROUTER_ADDRESS> <WETH_ADDRESS> <MAX_MESSAGES_PER_PERIOD>
```

### 3. Deploy to Polygon PoS (Chain ID 137)

1. Deploy WETH Contract
```bash
HARDHAT_IGNORE_NODE_VERSION=true pnpm hardhat run scripts/deploy.js --network polygon
```

2. Verify WETH Contract
```bash
HARDHAT_IGNORE_NODE_VERSION=true pnpm hardhat verify --network polygon <WETH_ADDRESS> "Wrapped Ether" "WETH"
```

3. Deploy CrossChainMessenger
```bash
HARDHAT_IGNORE_NODE_VERSION=true pnpm hardhat run scripts/deploy.js --network polygon --router <CCIP_ROUTER_ADDRESS> --weth <WETH_ADDRESS>
```

4. Verify CrossChainMessenger
```bash
HARDHAT_IGNORE_NODE_VERSION=true pnpm hardhat verify --network polygon <MESSENGER_ADDRESS> <ROUTER_ADDRESS> <WETH_ADDRESS> <MAX_MESSAGES_PER_PERIOD>
```

## Post-Deployment Steps

### 1. Contract Verification
After deployment, ensure all contracts are verified on their respective block explorers:
- Defi Oracle Meta Explorer: Verify CrossChainMessenger and WETH contracts
- PolygonScan: Verify CrossChainMessenger and WETH contracts

### 2. Configuration
1. Set Bridge Fee
```bash
HARDHAT_IGNORE_NODE_VERSION=true pnpm hardhat run scripts/setBridgeFee.js --network defiOracleMeta
HARDHAT_IGNORE_NODE_VERSION=true pnpm hardhat run scripts/setBridgeFee.js --network polygon
```

2. Configure Rate Limits
```bash
HARDHAT_IGNORE_NODE_VERSION=true pnpm hardhat run scripts/setRateLimit.js --network defiOracleMeta
HARDHAT_IGNORE_NODE_VERSION=true pnpm hardhat run scripts/setRateLimit.js --network polygon
```

### 3. Monitoring Setup
1. Start Monitoring Service
```bash
pnpm run monitor
```

2. Configure Alerts
```bash
pnpm run configure-alerts
```

## Security Checklist
- [ ] Verify contract ownership
- [ ] Test emergency pause functionality
- [ ] Confirm rate limits are properly set
- [ ] Verify CCIP router addresses
- [ ] Test cross-chain message passing
- [ ] Validate fee configurations
- [ ] Check monitoring alerts

## Troubleshooting

### Common Issues
1. **Deployment Failures**
   - Check network RPC endpoints
   - Verify account balance
   - Confirm gas settings

2. **Verification Failures**
   - Ensure correct constructor arguments
   - Check API keys
   - Verify compiler settings

3. **Configuration Issues**
   - Confirm owner address
   - Check transaction parameters
   - Verify network settings

### Emergency Procedures
1. **Pausing the Bridge**
```bash
HARDHAT_IGNORE_NODE_VERSION=true pnpm hardhat run scripts/pause.js --network <network>
```

2. **Emergency Withdrawal**
```bash
HARDHAT_IGNORE_NODE_VERSION=true pnpm hardhat run scripts/emergencyWithdraw.js --network <network>
```

## Maintenance
1. Regular health checks
2. Monitor gas usage
3. Track message volumes
4. Review error logs
5. Update parameters as needed

## Support
For deployment support or issues, contact the development team or create an issue in the repository.
