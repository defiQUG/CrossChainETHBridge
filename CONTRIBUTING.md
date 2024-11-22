# Contributing to CrossChainETHBridge

## Development Workflow

### Branch Strategy
- Default branch: `main`
- Feature branches: `devin/{timestamp}-{feature-name}`
- Generate timestamps with: `date +%s`

### Setup Process
1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy `.env.example` to `.env` and configure environment variables
4. Run tests:
   ```bash
   npx hardhat test
   ```

### Pull Request Process
1. Create a feature branch following naming convention
2. Make changes and ensure tests pass
3. Submit PR against main branch
4. Await review and address feedback
5. Merge after approval

### Branch Protection Rules
1. Required Reviews
   - Minimum of 1 reviewer approval
   - Dismiss stale pull request approvals
   - Require review from Code Owners

2. Status Checks
   - Build validation
   - Test suite completion
   - Code coverage thresholds
   - Linting standards

3. Branch Restrictions
   - Block force pushes
   - Prevent branch deletion
   - Require linear history
   - Require signed commits

## Development Standards

### Code Style
- Follow Solidity style guide
- Use consistent naming conventions
- Document public interfaces
- Write comprehensive tests

### Testing
- Write unit tests for all contracts
- Maintain high test coverage
- Test cross-chain functionality
- Document test scenarios

### Documentation
- Keep documentation up-to-date
- Document all public interfaces
- Include usage examples
- Update changelog

## License
This project is licensed under the MIT License - see the LICENSE file for details.
