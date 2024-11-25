// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IDefiOracle {
    /**
     * @dev Returns the current gas fee for a given chain
     * @param chainId The ID of the chain to get gas fee for
     * @return The current gas fee in wei
     */
    function getGasFee(uint256 chainId) external view returns (uint256);

    /**
     * @dev Returns the gas multiplier for a given chain
     * @param chainId The ID of the chain to get multiplier for
     * @return The gas multiplier (e.g., 150 for 1.5x)
     */
    function getGasMultiplier(uint256 chainId) external view returns (uint256);

    /**
     * @dev Updates the gas fee data for a chain
     * @param chainId The ID of the chain to update
     * @param newFee The new gas fee in wei
     */
    function updateGasFee(uint256 chainId, uint256 newFee) external;

    /**
     * @dev Updates the gas multiplier for a chain
     * @param chainId The ID of the chain to update
     * @param newMultiplier The new gas multiplier
     */
    function updateGasMultiplier(uint256 chainId, uint256 newMultiplier) external;

    /**
     * @dev Event emitted when gas fee is updated
     */
    event GasFeeUpdated(uint256 indexed chainId, uint256 newFee);

    /**
     * @dev Event emitted when gas multiplier is updated
     */
    event GasMultiplierUpdated(uint256 indexed chainId, uint256 newMultiplier);
}
