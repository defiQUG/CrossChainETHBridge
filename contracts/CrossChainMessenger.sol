// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";

interface IWETH is IERC20 {
    function deposit() external payable;
    function withdraw(uint256) external;
    receive() external payable;
}

/**
 * @title CrossChainMessenger
 * @dev A contract for bridging ETH between Defi Oracle Meta Mainnet and Polygon PoS using Chainlink's CCIP
 */
contract CrossChainMessenger is CCIPReceiver, Ownable, ReentrancyGuard, Pausable {
    // Chain selectors for source and destination chains
    uint64 public constant DEFI_ORACLE_META_SELECTOR = 138;
    uint64 public constant POLYGON_SELECTOR = 137;

    // WETH contract
    address payable public immutable WETH_ADDRESS;

    // Fee configuration
    uint256 public bridgeFee = 0.001 ether; // 0.1% fee
    uint256 public constant MAX_FEE = 0.01 ether; // 1% max fee

    // Rate limiting
    uint256 public constant MAX_TRANSFERS_PER_BLOCK = 5;
    uint256 public constant RATE_LIMIT_DURATION = 1 hours;
    uint256 public constant MAX_TRANSFERS_PER_DURATION = 100;

    mapping(uint256 => uint256) public transfersInBlock;
    mapping(address => uint256) public lastTransferTimestamp;
    mapping(address => uint256) public transfersInDuration;

    // Events
    event MessageSent(bytes32 indexed messageId, address indexed sender, uint256 amount, uint256 fee);
    event MessageReceived(bytes32 indexed messageId, address indexed receiver, uint256 amount);
    event BridgeFeeUpdated(uint256 newFee);
    event FundsRecovered(address token, uint256 amount);
    event RateLimitExceeded(address indexed sender, uint256 amount);

    /**
     * @dev Constructor initializes the contract with Chainlink's Router address and WETH address
     * @param _router The address of Chainlink's CCIP Router contract
     * @param _weth The address of the WETH contract
     */
    constructor(address _router, address payable _weth) CCIPReceiver(_router) ReentrancyGuard() {
        require(_router != address(0), "Invalid router address");
        require(_weth != address(0), "Invalid WETH address");
        WETH_ADDRESS = _weth;
    }

    /**
     * @dev Enforces rate limiting for transfers
     * @param _sender The address attempting the transfer
     */
    modifier rateLimit(address _sender) {
        require(transfersInBlock[block.number] < MAX_TRANSFERS_PER_BLOCK, "Block transfer limit exceeded");

        uint256 currentTime = block.timestamp;
        if (currentTime - lastTransferTimestamp[_sender] >= RATE_LIMIT_DURATION) {
            transfersInDuration[_sender] = 0;
        }

        require(transfersInDuration[_sender] < MAX_TRANSFERS_PER_DURATION, "Duration transfer limit exceeded");

        transfersInBlock[block.number]++;
        transfersInDuration[_sender]++;
        lastTransferTimestamp[_sender] = currentTime;

        _;
    }

    /**
     * @dev Sends ETH to Polygon, converting it to WETH
     * @param _receiver The address to receive WETH on Polygon
     */
    function sendToPolygon(address _receiver) external payable nonReentrant rateLimit(msg.sender) whenNotPaused {
        require(_receiver != address(0), "Invalid receiver");
        require(msg.value > bridgeFee, "Insufficient amount");

        uint256 transferAmount = msg.value - bridgeFee;

        // Prepare message data before any external calls
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            // Properly encode receiver address as bytes
            receiver: abi.encodePacked(_receiver),
            // Encode both receiver and amount together in data field
            data: abi.encode(_receiver, transferAmount),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({
                    gasLimit: 200_000,
                    strict: true
                })
            ),
            feeToken: address(0)
        });

        // Get fee (external read-only call)
        uint256 ccipFee = IRouterClient(i_router).getFee(POLYGON_SELECTOR, message);
        require(bridgeFee >= ccipFee, "Insufficient fee for CCIP");

        // Interactions (after all checks and effects)
        bytes32 messageId = IRouterClient(i_router).ccipSend{value: ccipFee}(
            POLYGON_SELECTOR,
            message
        );

        // Events after all state changes and interactions
        emit MessageSent(messageId, msg.sender, transferAmount, bridgeFee);
    }

    /**
     * @dev Handles incoming messages from other chains
     * @param any2EvmMessage The CCIP message containing transfer details
     */
    function _ccipReceive(Client.Any2EVMMessage memory any2EvmMessage) internal override nonReentrant rateLimit(tx.origin) whenNotPaused {
        // Checks
        require(msg.sender == address(i_router), "Caller is not the router");
        require(
            any2EvmMessage.sourceChainSelector == DEFI_ORACLE_META_SELECTOR,
            "Message from invalid chain"
        );

        // Effects (decode and validate message)
        (address receiver, uint256 amount) = abi.decode(
            any2EvmMessage.data,
            (address, uint256)
        );
        require(receiver != address(0), "Invalid receiver");
        require(amount > 0, "Invalid amount");

        // Store message details before interactions
        bytes32 messageId = any2EvmMessage.messageId;

        // Interactions (after all checks and effects)
        // First deposit ETH to get WETH
        IWETH(WETH_ADDRESS).deposit{value: amount}();

        // Then transfer WETH to receiver
        require(
            IWETH(WETH_ADDRESS).transfer(receiver, amount),
            "WETH transfer failed"
        );

        // Events after all state changes and interactions
        emit MessageReceived(messageId, receiver, amount);
    }

    /**
     * @dev Updates the bridge fee
     * @param _newFee New fee amount
     */
    function updateBridgeFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= MAX_FEE, "Fee exceeds maximum");
        bridgeFee = _newFee;
        emit BridgeFeeUpdated(_newFee);
    }

    /**
     * @dev Recovers stuck tokens in emergency
     * @param _token Token address (address(0) for ETH)
     */
    function recoverFunds(address _token) external onlyOwner nonReentrant {
        if (_token == address(0)) {
            uint256 balance = address(this).balance;
            require(balance > 0, "No ETH to recover");
            (bool success,) = owner().call{value: balance}("");
            require(success, "ETH recovery failed");
            emit FundsRecovered(address(0), balance);
        } else {
            uint256 balance = IERC20(_token).balanceOf(address(this));
            require(balance > 0, "No tokens to recover");
            require(
                IERC20(_token).transfer(owner(), balance),
                "Token recovery failed"
            );
            emit FundsRecovered(_token, balance);
        }
    }

    /**
     * @dev Pauses the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    receive() external payable nonReentrant whenNotPaused {
        // Emit an event for monitoring
        emit MessageReceived(bytes32(0), msg.sender, msg.value);
    }
}
