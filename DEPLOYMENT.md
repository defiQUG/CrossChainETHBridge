# Cross-Chain ETH Bridge Deployment Guide

## Prerequisites
- Node.js v20.x
- pnpm v8.x
- Hardhat v2.22.x
- Access to network RPC endpoints
- Private key with sufficient funds for deployment
- Environment variables configured (see below)

## Environment Setup

1. Install dependencies:
```bash
pnpm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Required variables:
- `PRIVATE_KEY`: Deployment wallet private key
- `INFURA_API_KEY`: Infura API key for network access
- `ROUTER_ADDRESS`: Chainlink CCIP Router address
- `BRIDGE_FEE`: Base fee for bridge operations
- `MAX_FEE`: Maximum allowed fee
- `MAX_MESSAGES_PER_PERIOD`: Rate limit for messages
- `PERIOD_LENGTH`: Time period for rate limiting
- `PAUSE_THRESHOLD`: Amount threshold for emergency pause
- `PAUSE_DURATION`: Duration of emergency pause

## Network Configurations

### Defi Oracle Meta Mainnet (Chain ID: 138)
- RPC URL: `https://mainnet-rpc.domoracle.com`
- CCIP Router: `0x<router_address>`
- Explorer: `https://scan.domoracle.com`
- Gas Price Strategy: Use network suggested price

### Polygon PoS (Chain ID: 137)
- RPC URL: `https://polygon-rpc.com`
- CCIP Router: `0x<router_address>`
- Explorer: `https://polygonscan.com`
- Gas Price Strategy: Use EIP-1559 pricing

## Deployment Steps

1. Deploy Mock Contracts (Development Only):
```bash
pnpm hardhat run scripts/deploy-mocks.js --network <network>
```

2. Deploy Core Contracts:
```bash
pnpm hardhat run scripts/deploy.js --network <network>
```

3. Verify Contracts:
```bash
pnpm hardhat run scripts/verify-contracts.js --network <network>
```

## Security Procedures

### Emergency Pause
The system can be paused in two ways:
1. Automatic pause when transfer amount exceeds `PAUSE_THRESHOLD`
2. Manual pause by contract owner

To manually pause:
```bash
pnpm hardhat run scripts/pause.js --network <network>
```

### Rate Limiting
The system enforces message rate limiting:
- Maximum messages per period: Configured via `MAX_MESSAGES_PER_PERIOD`
- Period length: Configured via `PERIOD_LENGTH`

To update rate limits:
```bash
pnpm hardhat run scripts/setRateLimit.js --network <network>
```

## Monitoring Setup

1. Configure Monitoring:
```bash
pnpm hardhat run scripts/monitoring/setup.js
```

2. Set up alerts:
```bash
pnpm hardhat run scripts/monitoring/configure-alerts.js
```

Monitor these metrics:
- Message processing time
- Failed transactions
- Gas costs
- Bridge usage statistics

## Post-Deployment Verification

1. Verify contract parameters
2. Test emergency procedures
3. Validate rate limiting
4. Check monitoring systems
5. Document deployed addresses

## Troubleshooting

Common issues and solutions:
1. Transaction Underpriced: Adjust gas price strategy
2. Verification Failed: Check constructor arguments
3. Rate Limit Issues: Verify period configuration

## Contract Addresses

### Defi Oracle Meta Mainnet (Chain ID: 138)
- CrossChainMessenger: `<address>`
- MockRouter: `<address>`
- MockWETH: `<address>`

### Polygon PoS (Chain ID: 137)
- CrossChainMessenger: `<address>`
- MockRouter: `<address>`
- MockWETH: `<address>`

## Support and Maintenance

For issues or updates:
1. Check monitoring alerts
2. Review transaction logs
3. Contact development team
4. Follow emergency procedures if needed
