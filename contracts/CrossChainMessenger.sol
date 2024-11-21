// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CrossChainMessenger
 * @dev A contract for bridging ETH between Defi Oracle Meta Mainnet and Polygon PoS using Chainlink's CCIP
 */
contract CrossChainMessenger is CCIPReceiver, Ownable {
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
    constructor(address _router) CCIPReceiver(_router) {}

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
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({
                    gasLimit: 200_000,
                    strict: false
                })
            ),
            feeToken: address(0) // Use native token for fees
        });

        // Get the fee for sending message
        uint256 fee = IRouterClient(i_router).getFee(POLYGON_SELECTOR, message);
        require(msg.value > fee, "Insufficient ETH for fees");

        // Send the message
        bytes32 messageId = IRouterClient(i_router).ccipSend{value: msg.value}(
            POLYGON_SELECTOR,
            message
        );

        emit MessageSent(messageId, msg.sender, msg.value - fee);
    }

    /**
     * @dev Handles incoming messages from other chains
     * @param any2EvmMessage The CCIP message containing transfer details
     */
    function _ccipReceive(Client.Any2EVMMessage memory any2EvmMessage) internal override {
        require(
            any2EvmMessage.sourceChainSelector == DEFI_ORACLE_META_SELECTOR,
            "Message from invalid chain"
        );

        address receiver = abi.decode(any2EvmMessage.data, (address));

        emit MessageReceived(
            any2EvmMessage.messageId,
            receiver,
            any2EvmMessage.destTokenAmounts.length > 0 ? any2EvmMessage.destTokenAmounts[0].amount : 0
        );
    }

    /**
     * @dev Allows the contract to receive ETH
     */
    receive() external payable {}
}
