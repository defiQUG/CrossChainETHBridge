// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title EmergencyPause
 * @dev Implements emergency pause functionality with enhanced access controls
 */
contract EmergencyPause is Ownable, Pausable, ReentrancyGuard {
    mapping(address => bool) public pausers;
    uint256 public constant PAUSE_DELAY = 1 hours;
    uint256 public lastPauseRequest;
    address public pendingPauser;

    event PauserAdded(address indexed pauser);
    event PauserRemoved(address indexed pauser);
    event PauseRequested(address indexed requester, uint256 effectiveTime);
    event PauseCancelled(address indexed requester);

    error NotAuthorized();
    error PauseDelayNotMet();
    error NoPendingPause();
    error AlreadyPauser();
    error NotPauser();

    modifier onlyPauser() {
        if (!pausers[msg.sender] && msg.sender != owner()) revert NotAuthorized();
        _;
    }

    constructor() {
        pausers[msg.sender] = true;
        emit PauserAdded(msg.sender);
    }

    /**
     * @dev Adds a new address to the pausers list
     * @param _pauser Address to add as pauser
     */
    function addPauser(address _pauser) external onlyOwner {
        if (pausers[_pauser]) revert AlreadyPauser();
        pausers[_pauser] = true;
        emit PauserAdded(_pauser);
    }

    /**
     * @dev Removes an address from the pausers list
     * @param _pauser Address to remove as pauser
     */
    function removePauser(address _pauser) external onlyOwner {
        if (!pausers[_pauser]) revert NotPauser();
        pausers[_pauser] = false;
        emit PauserRemoved(_pauser);
    }

    /**
     * @dev Requests a pause with delay
     */
    function requestPause() external onlyPauser {
        lastPauseRequest = block.timestamp;
        pendingPauser = msg.sender;
        emit PauseRequested(msg.sender, block.timestamp + PAUSE_DELAY);
    }

    /**
     * @dev Executes pending pause after delay
     */
    function executePause() external onlyPauser nonReentrant {
        if (pendingPauser == address(0)) revert NoPendingPause();
        if (block.timestamp < lastPauseRequest + PAUSE_DELAY) revert PauseDelayNotMet();
        _pause();
        pendingPauser = address(0);
    }

    /**
     * @dev Cancels pending pause request
     */
    function cancelPause() external {
        if (msg.sender != pendingPauser && msg.sender != owner()) revert NotAuthorized();
        pendingPauser = address(0);
        emit PauseCancelled(msg.sender);
    }

    /**
     * @dev Unpauses the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency pause without delay, only callable by owner
     */
    function emergencyPause() external onlyOwner {
        _pause();
    }
}
