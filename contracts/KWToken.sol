// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title KW Token - Reward token for KW Vault ecosystem
 * @dev ERC-20 token with minting capabilities for vault rewards
 */
contract KWToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    
    mapping(address => bool) public minters;
    
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    constructor() ERC20("KW Token", "KW") Ownable(msg.sender) {}
    
    function mint(address to, uint256 amount) external {
        require(minters[msg.sender], "KWToken: not authorized minter");
        require(totalSupply() + amount <= MAX_SUPPLY, "KWToken: exceeds max supply");
        
        _mint(to, amount);
    }
    
    function addMinter(address minter) external onlyOwner {
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
}
