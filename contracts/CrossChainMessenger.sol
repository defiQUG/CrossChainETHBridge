// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CrossChainMessenger
 * @dev A contract for bridging ETH between Defi Oracle Meta Mainnet and Polygon PoS using Chainlink's CCIP
 */
contract CrossChainMessenger is Ownable {
    // Chainlink Router interface for cross-chain communication
    IRouterClient private immutable router;

    // Chain selectors for source and destination chains
    uint64 public constant DEFI_ORACLE_META_SELECTOR = 138;
    uint64 public constant POLYGON_SELECTOR = 137;

    // Events
    event MessageSent(bytes32 indexed messageId, address indexed sender, uint256 amount);
    event MessageReceived(bytes32 indexed messageId, address indexed receiver, uint256 amount);

    /**
     * @dev Constructor initializes the contract with Chainlink's Router address
     * @param _router The address of Chainlink's CCIP Router contract
     */
    constructor(address _router) Ownable(msg.sender) {
        router = IRouterClient(_router);
    }

    /**
     * @dev Sends ETH to Polygon, converting it to WETH
     * @param _receiver The address to receive WETH on Polygon
     */
    function sendToPolygon(address _receiver) external payable {
        require(msg.value > 0, "Must send ETH");

        // Prepare the CCIP message
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(_receiver),
            data: "",
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: "",
            feeToken: address(0) // Use native token for fees
        });

        // Get the fee for sending message
        uint256 fee = router.getFee(POLYGON_SELECTOR, message);
        require(msg.value > fee, "Insufficient ETH for fees");

        // Send the message
        bytes32 messageId = router.ccipSend{value: msg.value}(
            POLYGON_SELECTOR,
            message
        );

        emit MessageSent(messageId, msg.sender, msg.value - fee);
    }

    /**
     * @dev Handles incoming messages from other chains
     * @param message The CCIP message containing transfer details
     */
    function _ccipReceive(Client.Any2EVMMessage memory message) internal {
        require(
            message.sourceChainSelector == DEFI_ORACLE_META_SELECTOR,
            "Message from invalid chain"
        );

        address receiver = abi.decode(message.receiver, (address));

        emit MessageReceived(
            message.messageId,
            receiver,
            message.amount
        );
    }

    /**
     * @dev Allows the contract to receive ETH
     */
    receive() external payable {}
}
