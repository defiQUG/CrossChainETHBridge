# CrossChainETHBridge

Cross-chain messaging solution that bridges ETH from Defi Oracle Meta Mainnet (Chain ID 138) to Polygon PoS (Chain ID 137), representing it as WETH on Polygon using Chainlink's Cross-Chain Interoperability Protocol (CCIP).

## Project Overview

This project implements a secure bridge for transferring ETH between chains using Chainlink's CCIP protocol. It includes smart contracts, deployment scripts, testing frameworks, and continuous integration setup.

### Features

- Cross-chain ETH transfers from Defi Oracle Meta Mainnet to Polygon PoS
- WETH representation on Polygon
- Secure message passing using Chainlink CCIP
- Comprehensive testing suite
- Automated CI/CD pipeline

## Architecture

The system consists of two main smart contracts:
1. Source Chain Contract (Defi Oracle Meta Mainnet)
   - Handles ETH locking and CCIP message initiation
   - Manages cross-chain transfer requests
2. Destination Chain Contract (Polygon PoS)
   - Receives CCIP messages
   - Mints WETH tokens on successful message receipt

## Setup Instructions

### Prerequisites

- Node.js v16 or higher
- pnpm package manager
- Hardhat development environment
- MetaMask or similar Web3 wallet
- Infura API key for network access
- Private key for contract deployment

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/defiQUG/CrossChainETHBridge.git
   cd CrossChainETHBridge
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## Development

### Local Testing

1. Run local hardhat node:
   ```bash
   pnpm hardhat node
   ```

2. Run tests:
   ```bash
   pnpm test
   ```

### Deployment Guide

1. Configure networks in `hardhat.config.js`
2. Deploy to Defi Oracle Meta Mainnet:
   ```bash
   pnpm deploy:source
   ```
3. Deploy to Polygon PoS:
   ```bash
   pnpm deploy:destination
   ```
4. Verify contracts on respective explorers:
   ```bash
   pnpm verify:source
   pnpm verify:destination
   ```

## Testing

The project includes comprehensive tests:

- Unit tests for individual contract functions
- Integration tests for cross-chain messaging
- End-to-end tests for complete transfer flow

Run tests with coverage:
```bash
pnpm test:coverage
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow Solidity style guide
- Maintain test coverage above 90%
- Update documentation for any changes
- Follow conventional commits specification
- Add appropriate tests for new features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Development Status

🚧 Project is currently under active development.
