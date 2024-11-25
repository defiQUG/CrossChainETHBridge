// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockWETH is ERC20 {
    event Deposit(address indexed dst, uint256 wad);
    event Withdrawal(address indexed src, uint256 wad);

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function deposit() public payable {
        // Allow zero deposits to match standard WETH behavior
        _mint(msg.sender, msg.value);
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "MockWETH: zero withdrawal amount");
        require(balanceOf(msg.sender) >= amount, "ERC20: burn amount exceeds balance");

        // Burn tokens before transfer to prevent reentrancy
        _burn(msg.sender, amount);

        // Transfer ETH
        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "MockWETH: ETH transfer failed");

        emit Withdrawal(msg.sender, amount);
    }

    receive() external payable {
        deposit();
    }
}
