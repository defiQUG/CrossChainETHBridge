#!/bin/bash

# Function to run tests with Node.js version override
run_tests() {
    HARDHAT_IGNORE_NODE_VERSION=1 pnpm hardhat test "$1"
}

# Function to display progress
show_progress() {
    echo "=== MVP Tasks Progress ==="
    echo "Rate Limiting: Testing in progress..."
    echo "Emergency Pause: Implementation in progress..."
    echo "Test Coverage: Improvement in progress..."
}

# Run tasks in parallel
echo "Starting parallel execution of MVP tasks..."

# Run rate limiter tests
run_tests "test/RateLimiter.test.js" > rate_limiter.log 2>&1 &
PID1=$!

# Run coverage improvement tests
run_tests "test/coverage-improvement.test.js" > coverage_improvement.log 2>&1 &
PID2=$!

# Run emergency pause tests
run_tests "test/CrossChainMessenger.test.js" > emergency_pause.log 2>&1 &
PID3=$!

# Monitor progress
while kill -0 $PID1 2>/dev/null || kill -0 $PID2 2>/dev/null || kill -0 $PID3 2>/dev/null; do
    clear
    show_progress
    echo ""
    echo "Checking test results..."

    if [ -f rate_limiter.log ]; then
        echo "Rate Limiter Tests:" $(tail -n 1 rate_limiter.log)
    fi

    if [ -f coverage_improvement.log ]; then
        echo "Coverage Tests:" $(tail -n 1 coverage_improvement.log)
    fi

    if [ -f emergency_pause.log ]; then
        echo "Emergency Pause Tests:" $(tail -n 1 emergency_pause.log)
    fi

    sleep 2
done

# Clean up log files
rm -f rate_limiter.log coverage_improvement.log emergency_pause.log

echo "All MVP tasks completed!"
