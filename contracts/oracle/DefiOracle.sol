// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IDefiOracle.sol";

contract DefiOracle is IDefiOracle, Ownable {
    mapping(uint256 => uint256) private gasFees;
    mapping(uint256 => uint256) private gasMultipliers;

    // Constants for chain IDs
    uint256 public constant DEFI_ORACLE_META_CHAIN_ID = 138;
    uint256 public constant POLYGON_CHAIN_ID = 137;

    constructor() {
        // Initialize with default values
        gasFees[DEFI_ORACLE_META_CHAIN_ID] = 50 gwei;  // Increased from 30 gwei
        gasFees[POLYGON_CHAIN_ID] = 30 gwei;  // Decreased from 50 gwei

        // Set default multipliers (1.5x for Defi Oracle Meta, 1x for Polygon)
        gasMultipliers[DEFI_ORACLE_META_CHAIN_ID] = 150;
        gasMultipliers[POLYGON_CHAIN_ID] = 100;
    }

    function getGasFee(uint256 chainId) external view override returns (uint256) {
        require(gasFees[chainId] > 0, "Chain not supported");
        return gasFees[chainId];
    }

    function getGasMultiplier(uint256 chainId) external view override returns (uint256) {
        require(gasMultipliers[chainId] > 0, "Chain not supported");
        return gasMultipliers[chainId];
    }

    function updateGasFee(uint256 chainId, uint256 newFee) external override onlyOwner {
        require(newFee > 0, "Invalid fee");
        require(chainId == DEFI_ORACLE_META_CHAIN_ID || chainId == POLYGON_CHAIN_ID, "Unsupported chain");
        gasFees[chainId] = newFee;
        emit GasFeeUpdated(chainId, newFee);
    }

    function updateGasMultiplier(uint256 chainId, uint256 newMultiplier) external override onlyOwner {
        require(newMultiplier > 0, "Invalid multiplier");
        require(chainId == DEFI_ORACLE_META_CHAIN_ID || chainId == POLYGON_CHAIN_ID, "Unsupported chain");
        gasMultipliers[chainId] = newMultiplier;
        emit GasMultiplierUpdated(chainId, newMultiplier);
    }
}
