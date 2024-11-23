# Deployment Guide

## Prerequisites
- Node.js v20.x
- pnpm
- Hardhat

## Network Configuration
- Defi Oracle Meta Mainnet (Chain ID 138)
- Polygon PoS (Chain ID 137)

## Contract Addresses
- Router: [TBD]
- WETH: [TBD]
- CrossChainMessenger: [TBD]

## Security Features
### Rate Limiting
- Default rate: 1 ETH per hour
- Configurable via admin interface
- Prevents excessive transfers
- Monitored per user address

### Emergency Pause
- Automatic pause on large transfers (>100 ETH)
- 24-hour cooldown period
- Admin override capability
- Manual pause/unpause functionality

## Deployment Steps
1. Install dependencies:
```bash
pnpm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your values
```

3. Deploy contracts:
```bash
pnpm hardhat run scripts/deploy.js --network mainnet
```

4. Verify contracts:
```bash
pnpm hardhat verify --network mainnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## Security Considerations
- Rate limiting prevents excessive transfers
- Emergency pause activates on large transfers
- Admin controls for fee adjustment
- Multi-signature support for critical functions

## Monitoring
- Transaction monitoring setup
- Alert system configuration
- Backup node setup
- Emergency response procedures

## Testing
```bash
# Run all tests
pnpm hardhat test

# Generate coverage report
pnpm hardhat coverage
```

## Maintenance
- Regular security audits
- Performance monitoring
- Rate limit adjustments
- Emergency procedure drills
