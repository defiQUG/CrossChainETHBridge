#!/bin/bash

# Function to cleanup processes on exit
cleanup() {
    echo "Cleaning up processes..."
    pkill -f "hardhat node" || true
    pkill -f "hardhat test" || true
    pkill -f "monitor-service.js" || true
    pkill -f "track-progress.js" || true
    exit 0
}

# Set up cleanup trap
trap cleanup EXIT

# Ensure logs directory exists
mkdir -p logs

# Kill any existing processes
echo "Killing existing processes..."
cleanup

# Start hardhat node and wait for it to be ready
echo "Starting Hardhat node..."
npx hardhat node > logs/hardhat.log 2>&1 &
HARDHAT_PID=$!

# Wait for node to start
echo "Waiting for Hardhat node to start..."
sleep 10

# Verify node is running
curl -s -X POST -H "Content-Type: application/json" \
     --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
     http://127.0.0.1:8545 > /dev/null

if [ $? -ne 0 ]; then
    echo "Failed to start Hardhat node"
    exit 1
fi

echo "Hardhat node is running"

# Start all tasks in parallel
echo "Starting parallel MVP tasks..."

# Run tests
NODE_OPTIONS="--max-old-space-size=4096" npx hardhat test --network localhost > logs/tests.log 2>&1 &
TEST_PID=$!

# Run coverage
NODE_OPTIONS="--max-old-space-size=4096" npx hardhat coverage --network localhost > logs/coverage.log 2>&1 &
COVERAGE_PID=$!

# Run gas optimization tests
NODE_OPTIONS="--max-old-space-size=4096" npx hardhat test test/gas-optimization.test.js --network localhost > logs/gas.log 2>&1 &
GAS_PID=$!

# Start monitoring service
CONTRACT_ADDRESS="0x0000000000000000000000000000000000000000" \
RPC_URL="http://127.0.0.1:8545" \
node scripts/monitoring/monitor-service.js > logs/monitor.log 2>&1 &
MONITOR_PID=$!

# Start progress tracking
node scripts/track-progress.js > logs/progress.log 2>&1 &
PROGRESS_PID=$!

# Monitor progress
echo "Monitoring progress..."
while true; do
    echo "=== Progress Report ==="
    cat progress.json
    echo -e "\n=== Test Logs ==="
    tail -n 5 logs/tests.log
    echo -e "\n=== Coverage Logs ==="
    tail -n 5 logs/coverage.log
    echo -e "\n=== Gas Optimization Logs ==="
    tail -n 5 logs/gas.log
    echo -e "\n=== Monitor Logs ==="
    tail -n 5 logs/monitor.log
    sleep 30
done
