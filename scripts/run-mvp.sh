#!/bin/bash

echo "=== Starting MVP Tasks in Parallel ==="

# Kill any existing processes
pkill -f "monitor.js" || true
pkill -f "alerts.js" || true
sleep 2

# Start monitoring and alert services
echo "Starting monitoring services..."
HARDHAT_IGNORE_NODE_VERSION=true node scripts/monitor.js > monitor.log 2>&1 &
HARDHAT_IGNORE_NODE_VERSION=true node scripts/monitoring/alerts.js > alerts.log 2>&1 &

# Run tests in parallel
echo "Running tests in parallel..."
HARDHAT_IGNORE_NODE_VERSION=true npx hardhat test test/gas-optimization.test.js &
HARDHAT_IGNORE_NODE_VERSION=true npx hardhat test test/CrossChainMessenger.test.js --grep "edge case" &
HARDHAT_IGNORE_NODE_VERSION=true npx hardhat coverage &

# Wait for all background processes
wait

echo "=== Verifying Services ==="
ps aux | grep -E "monitor.js|alerts.js" | grep -v grep

echo "=== Test Results ==="
cat coverage/lcov-report/index.html | grep -A 5 "Total"

echo "=== Progress Update ==="
node scripts/track-progress.js
