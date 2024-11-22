// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouter.sol";
import "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract CrossChainMessenger is OwnerIsCreator, ReentrancyGuard, Pausable {
    IRouterClient public immutable router;
    uint256 public constant POLYGON_CHAIN_SELECTOR = 137;
    uint256 public bridgeFee;
    uint256 public messageCounter;
    uint256 public constant MAX_MESSAGES_PER_HOUR = 100;

    event MessageSent(bytes32 indexed messageId, address indexed sender, address indexed recipient, uint256 amount);
    event MessageReceived(bytes32 indexed messageId, address indexed sender, address indexed recipient, uint256 amount);
    event BridgeFeeUpdated(uint256 newFee);
    event EmergencyWithdraw(address indexed recipient, uint256 amount);

    constructor(address _router) {
        require(_router != address(0), "Invalid router address");
        router = IRouterClient(_router);
        bridgeFee = 0.001 ether;
    }

    function sendToPolygon(address _recipient) external payable nonReentrant whenNotPaused {
        require(msg.value > bridgeFee, "Insufficient amount");
        require(messageCounter < MAX_MESSAGES_PER_HOUR, "Message limit exceeded");

        bytes memory data = abi.encode(_recipient, msg.value - bridgeFee);
        bytes32 messageId = router.ccipSend{value: msg.value}(
            POLYGON_CHAIN_SELECTOR,
            data
        );

        messageCounter++;
        emit MessageSent(messageId, msg.sender, _recipient, msg.value - bridgeFee);
    }

    function ccipReceive(bytes calldata data) external whenNotPaused {
        require(msg.sender == address(router), "Only router can call");

        (address recipient, uint256 amount) = abi.decode(data, (address, uint256));
        require(recipient != address(0), "Invalid recipient");

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");

        emit MessageReceived(bytes32(0), msg.sender, recipient, amount);
    }

    function updateBridgeFee(uint256 _newFee) external onlyOwner {
        bridgeFee = _newFee;
        emit BridgeFeeUpdated(_newFee);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw(address payable _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid recipient");
        uint256 balance = address(this).balance;
        (bool success, ) = _recipient.call{value: balance}("");
        require(success, "Transfer failed");
        emit EmergencyWithdraw(_recipient, balance);
    }

    receive() external payable {}
}
