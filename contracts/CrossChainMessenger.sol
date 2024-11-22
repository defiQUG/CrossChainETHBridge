// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouter.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract CrossChainMessenger is OwnerIsCreator, ReentrancyGuard, Pausable {
    using Client for Client.EVM2AnyMessage;

    IRouterClient public immutable router;
    uint64 public constant POLYGON_CHAIN_SELECTOR = 137;
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

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(_recipient),
            data: abi.encode(msg.value - bridgeFee),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: "",
            feeToken: address(0)
        });

        bytes32 messageId = router.ccipSend{value: msg.value}(
            POLYGON_CHAIN_SELECTOR,
            message
        );

        messageCounter++;
        emit MessageSent(messageId, msg.sender, _recipient, msg.value - bridgeFee);
    }

    function ccipReceive(Client.Any2EVMMessage calldata message) external whenNotPaused {
        require(msg.sender == address(router), "Only router can call");

        address recipient = abi.decode(message.sender, (address));
        uint256 amount = abi.decode(message.data, (uint256));
        require(recipient != address(0), "Invalid recipient");

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");

        emit MessageReceived(message.messageId, msg.sender, recipient, amount);
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
