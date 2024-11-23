// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouter.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RateLimiter.sol";
import "./EmergencyPause.sol";

interface IWETH {
    function deposit() external payable;
    function withdraw(uint256) external;
    function transfer(address to, uint256 value) external returns (bool);
}

contract CrossChainMessenger is ReentrancyGuard, RateLimiter, EmergencyPause, Ownable {
    using Client for Client.EVM2AnyMessage;

    IRouterClient public immutable router;
    IWETH public immutable weth;
    uint64 public constant POLYGON_CHAIN_SELECTOR = 137;
    uint256 public bridgeFee;

    event MessageSent(bytes32 indexed messageId, address indexed sender, address indexed recipient, uint256 amount);
    event MessageReceived(bytes32 indexed messageId, address indexed sender, address indexed recipient, uint256 amount);
    event BridgeFeeUpdated(uint256 newFee);
    event EmergencyWithdraw(address indexed recipient, uint256 amount);

    constructor(
        address _router,
        address _weth,
        uint256 _maxMessagesPerPeriod,
        uint256 _pauseThreshold,
        uint256 _pauseDuration
    )
        RateLimiter(_maxMessagesPerPeriod, 3600) // 1 hour period
        EmergencyPause(_pauseThreshold, _pauseDuration)
        Ownable(msg.sender)
    {
        require(_router != address(0), "CrossChainMessenger: zero router address");
        require(_weth != address(0), "CrossChainMessenger: zero WETH address");
        router = IRouterClient(_router);
        weth = IWETH(_weth);
        bridgeFee = 0.1 ether;
    }

    function getRouter() external view returns (address) {
        return address(router);
    }

    function getBridgeFee() external view returns (uint256) {
        return bridgeFee;
    }

    function sendToPolygon(address _recipient) external payable nonReentrant {
        require(!checkPauseStatus(), "CrossChainMessenger: contract is paused");
        require(msg.value > bridgeFee, "CrossChainMessenger: insufficient payment");
        require(_recipient != address(0), "CrossChainMessenger: zero recipient address");
        require(checkRateLimit(msg.sender, msg.value), "CrossChainMessenger: rate limit exceeded");

        uint256 transferAmount = msg.value - bridgeFee;
        updateTransferredAmount(msg.sender, msg.value);
        checkAndPause(msg.value);

        bytes memory data = abi.encode(_recipient, transferAmount);

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(_recipient),
            data: data,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: "",
            feeToken: address(0)
        });

        bytes32 messageId = router.ccipSend{value: bridgeFee}(
            POLYGON_CHAIN_SELECTOR,
            message
        );

        emit MessageSent(messageId, msg.sender, _recipient, transferAmount);
    }

    function ccipReceive(Client.Any2EVMMessage calldata message) external {
        require(!checkPauseStatus(), "CrossChainMessenger: contract is paused");
        require(msg.sender == address(router), "CrossChainMessenger: caller is not router");
        require(message.sourceChainSelector == 138, "CrossChainMessenger: invalid source chain");

        address sender = address(bytes20(message.sender));
        (address recipient, uint256 amount) = abi.decode(message.data, (address, uint256));

        require(recipient != address(0), "CrossChainMessenger: zero recipient address");
        require(amount > 0, "CrossChainMessenger: zero amount");
        require(address(this).balance >= amount, "CrossChainMessenger: insufficient balance");
        require(checkRateLimit(sender, amount), "CrossChainMessenger: rate limit exceeded");

        updateTransferredAmount(sender, amount);
        checkAndPause(amount);

        weth.deposit{value: amount}();
        require(weth.transfer(recipient, amount), "CrossChainMessenger: WETH transfer failed");

        emit MessageReceived(message.messageId, sender, recipient, amount);
    }

    function setBridgeFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1 ether, "CrossChainMessenger: fee exceeds maximum");
        bridgeFee = _newFee;
        emit BridgeFeeUpdated(_newFee);
    }

    function emergencyWithdraw(address payable _recipient) external onlyOwner {
        require(checkPauseStatus(), "CrossChainMessenger: contract not paused");
        require(_recipient != address(0), "CrossChainMessenger: zero recipient address");
        uint256 balance = address(this).balance;
        require(balance > 0, "CrossChainMessenger: no balance to withdraw");
        (bool success, ) = _recipient.call{value: balance}("");
        require(success, "CrossChainMessenger: transfer failed");
        emit EmergencyWithdraw(_recipient, balance);
    }

    receive() external payable {}
}
