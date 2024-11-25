// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../interfaces/IDefiOracle.sol";

contract MockDefiOracle is IDefiOracle {
    mapping(uint256 => uint256) private gasFees;
    mapping(uint256 => uint256) private gasMultipliers;

    constructor() {
        // Initialize with default values
        // Chain 138 (Defi Oracle Meta)
        gasFees[138] = 50 gwei;
        gasMultipliers[138] = 150; // 1.5x

        // Chain 137 (Polygon)
        gasFees[137] = 30 gwei;
        gasMultipliers[137] = 100; // 1.0x
    }

    function getGasFee(uint256 chainId) external view override returns (uint256) {
        require(chainId == 137 || chainId == 138, "Unsupported chain");
        return gasFees[chainId];
    }

    function getGasMultiplier(uint256 chainId) external view override returns (uint256) {
        require(chainId == 137 || chainId == 138, "Unsupported chain");
        return gasMultipliers[chainId];
    }

    function updateGasFee(uint256 chainId, uint256 newFee) external override {
        require(chainId == 137 || chainId == 138, "Unsupported chain");
        gasFees[chainId] = newFee;
        emit GasFeeUpdated(chainId, newFee);
    }

    function updateGasMultiplier(uint256 chainId, uint256 newMultiplier) external override {
        require(chainId == 137 || chainId == 138, "Unsupported chain");
        gasMultipliers[chainId] = newMultiplier;
        emit GasMultiplierUpdated(chainId, newMultiplier);
    }

    // Alias functions for test compatibility
    function setGasFee(uint256 chainId, uint256 newFee) external {
        updateGasFee(chainId, newFee);
    }

    function setGasMultiplier(uint256 chainId, uint256 newMultiplier) external {
        updateGasMultiplier(chainId, newMultiplier);
    }
}
