// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SkyRunToken is ERC20, Ownable {
    address public gameContract;

    error NotAuthorized();
    error InvalidAmount();

    constructor(string memory name_, string memory symbol_, address owner_)
        ERC20(name_, symbol_)
        Ownable(owner_)
    {}

    function setGameContract(address game) external onlyOwner {
        gameContract = game;
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != gameContract) revert NotAuthorized();
        if (amount == 0) revert InvalidAmount();
        _mint(to, amount);
    }
}


