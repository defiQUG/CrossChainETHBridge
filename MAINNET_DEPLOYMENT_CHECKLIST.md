# Mainnet Deployment Checklist

## Pre-Deployment Verification

### Contract Security
- [ ] All tests passing (75/75)
- [ ] Test coverage > 95% (current: 95.77%)
- [ ] Rate limiting configured and tested
- [ ] Emergency pause functionality verified
- [ ] Access controls validated
- [ ] No compiler warnings
- [ ] Gas optimization completed

### Documentation Review
- [ ] DEPLOYMENT.md reviewed and updated
- [ ] All script parameters documented
- [ ] Emergency procedures documented
- [ ] Monitoring setup instructions verified

## Network Configuration

### Defi Oracle Meta Mainnet (Chain ID 138)
- [ ] RPC endpoint configured and tested
- [ ] Network gas settings optimized
- [ ] CCIP Router address verified
- [ ] Block explorer API key configured
- [ ] Network fees estimated

### Polygon PoS (Chain ID 137)
- [ ] RPC endpoint configured and tested
- [ ] Network gas settings optimized
- [ ] CCIP Router address verified
- [ ] PolygonScan API key configured
- [ ] Network fees estimated

## Deployment Pipeline

### Environment Setup
- [ ] Node.js 20.x configured
- [ ] pnpm dependencies installed
- [ ] Environment variables configured
  - [ ] DEFI_ORACLE_META_RPC
  - [ ] POLYGON_RPC
  - [ ] DEPLOYER_PRIVATE_KEY
  - [ ] POLYGONSCAN_API_KEY
  - [ ] DEFI_ORACLE_SCAN_API_KEY

### Contract Deployment Order
1. [ ] Deploy WETH on Defi Oracle Meta
2. [ ] Verify WETH on Defi Oracle Meta
3. [ ] Deploy CrossChainMessenger on Defi Oracle Meta
4. [ ] Verify CrossChainMessenger on Defi Oracle Meta
5. [ ] Deploy WETH on Polygon PoS
6. [ ] Verify WETH on Polygon PoS
7. [ ] Deploy CrossChainMessenger on Polygon PoS
8. [ ] Verify CrossChainMessenger on Polygon PoS

### Post-Deployment Configuration
- [ ] Set bridge fees on both networks
- [ ] Configure rate limits
- [ ] Verify owner access
- [ ] Test pause functionality
- [ ] Configure monitoring alerts

## Contract Verification

### Defi Oracle Meta Explorer
- [ ] WETH contract verified
  - [ ] Constructor arguments confirmed
  - [ ] Source code matches deployment
  - [ ] License verified
- [ ] CrossChainMessenger contract verified
  - [ ] Constructor arguments confirmed
  - [ ] Source code matches deployment
  - [ ] License verified

### PolygonScan
- [ ] WETH contract verified
  - [ ] Constructor arguments confirmed
  - [ ] Source code matches deployment
  - [ ] License verified
- [ ] CrossChainMessenger contract verified
  - [ ] Constructor arguments confirmed
  - [ ] Source code matches deployment
  - [ ] License verified

## Monitoring Setup

### Infrastructure
- [ ] Monitoring scripts deployed
- [ ] Alert thresholds configured
- [ ] Logging system active
- [ ] Health check endpoints configured

### Alerts Configuration
- [ ] Rate limit alerts set
- [ ] Gas price alerts configured
- [ ] Error rate monitoring active
- [ ] Balance monitoring active

## Testing Pipeline

### Testnet Verification
- [ ] Complete testnet deployment successful
- [ ] Cross-chain messaging verified
- [ ] Fee calculations confirmed
- [ ] Rate limiting tested
- [ ] Emergency procedures verified

### Production Readiness
- [ ] All security checks passed
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Emergency contacts configured
- [ ] Incident response plan ready

## Final Checks

### Security
- [ ] No exposed private keys
- [ ] All API keys secured
- [ ] Access controls verified
- [ ] Emergency contacts confirmed

### Documentation
- [ ] All procedures documented
- [ ] Contact information updated
- [ ] Troubleshooting guide complete
- [ ] Maintenance procedures documented

### Backup Procedures
- [ ] Backup RPC endpoints configured
- [ ] Recovery procedures documented
- [ ] Emergency fund recovery tested
- [ ] Backup monitoring setup

## Sign-off Requirements
- [ ] Technical lead approval
- [ ] Security review completed
- [ ] Documentation approved
- [ ] Deployment plan confirmed
- [ ] Monitoring setup verified
