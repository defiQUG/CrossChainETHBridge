#!/bin/bash
# Fix ethers.parseEther to ethers.utils.parseEther in all test files
find /home/ubuntu/CrossChainETHBridge/test -type f -name "*.js" -exec sed -i 's/ethers\.parseEther/ethers.utils.parseEther/g' {} +

# Fix other ethers v5 compatibility issues
find /home/ubuntu/CrossChainETHBridge/test -type f -name "*.js" -exec sed -i 's/ethers\.getAddress/ethers.utils.getAddress/g' {} +
