// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC4626.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title KW Vault - AI-Driven Cross-Chain Yield Vault
 * @dev ERC-4626 compliant vault with AI yield optimization and cross-chain support
 */
contract KWVault is ERC20, IERC4626, Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // State variables
    IERC20 public immutable asset; // USDT token
    uint256 public totalAssets;
    uint256 public performanceFee = 1000; // 10% in basis points
    uint256 public managementFee = 200; // 2% annual in basis points
    uint256 public lastFeeCollection;
    
    // AI and strategy parameters
    uint256 public targetAPY = 800; // 8% target APY in basis points
    uint256 public hedgeRatio = 5000; // 50% hedge ratio in basis points
    uint256 public rebalanceThreshold = 500; // 5% threshold for rebalancing
    
    // Cross-chain and privacy
    mapping(address => bool) public authorizedBridges;
    mapping(address => bool) public zkMeVerified;
    mapping(address => uint256) public lastWithdrawTime;
    uint256 public withdrawCooldown = 1 hours;
    
    // Gaming and SocialFi
    mapping(address => uint256) public kwTokenRewards;
    mapping(address => uint256) public missionPoints;
    uint256 public totalKWTokens;
    
    // Events
    event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
    event Rebalance(uint256 newHedgeRatio, uint256 timestamp);
    event EmergencyWithdraw(address indexed user, uint256 amount);
    event KWTokensEarned(address indexed user, uint256 amount);
    event MissionCompleted(address indexed user, string mission, uint256 points);
    event ZkMeVerification(address indexed user, bool verified);
    
    constructor(
        address _asset,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        asset = IERC20(_asset);
        lastFeeCollection = block.timestamp;
    }
    
    // ERC-4626 Implementation
    function totalAssets() public view override returns (uint256) {
        return totalAssets;
    }
    
    function convertToShares(uint256 assets) public view override returns (uint256) {
        return _convertToShares(assets, Math.Rounding.Floor);
    }
    
    function convertToAssets(uint256 shares) public view override returns (uint256) {
        return _convertToAssets(shares, Math.Rounding.Floor);
    }
    
    function maxDeposit(address) public pure override returns (uint256) {
        return type(uint256).max;
    }
    
    function maxMint(address) public pure override returns (uint256) {
        return type(uint256).max;
    }
    
    function maxWithdraw(address owner) public view override returns (uint256) {
        return _convertToAssets(balanceOf(owner), Math.Rounding.Floor);
    }
    
    function maxRedeem(address owner) public view override returns (uint256) {
        return balanceOf(owner);
    }
    
    function previewDeposit(uint256 assets) public view override returns (uint256) {
        return _convertToShares(assets, Math.Rounding.Floor);
    }
    
    function previewMint(uint256 shares) public view override returns (uint256) {
        return _convertToAssets(shares, Math.Rounding.Ceil);
    }
    
    function previewWithdraw(uint256 assets) public view override returns (uint256) {
        return _convertToShares(assets, Math.Rounding.Ceil);
    }
    
    function previewRedeem(uint256 shares) public view override returns (uint256) {
        return _convertToAssets(shares, Math.Rounding.Floor);
    }
    
    // Core vault functions
    function deposit(uint256 assets, address receiver) 
        public 
        override 
        nonReentrant 
        whenNotPaused 
        returns (uint256 shares) 
    {
        require(assets > 0, "KWVault: zero assets");
        
        shares = previewDeposit(assets);
        require(shares > 0, "KWVault: zero shares");
        
        asset.safeTransferFrom(msg.sender, address(this), assets);
        totalAssets += assets;
        _mint(receiver, shares);
        
        // Award KW tokens for deposit
        uint256 kwReward = (assets * 100) / 10000; // 1% of deposit as KW tokens
        kwTokenRewards[receiver] += kwReward;
        totalKWTokens += kwReward;
        
        emit Deposit(msg.sender, receiver, assets, shares);
        emit KWTokensEarned(receiver, kwReward);
        
        return shares;
    }
    
    function mint(uint256 shares, address receiver) 
        public 
        override 
        nonReentrant 
        whenNotPaused 
        returns (uint256 assets) 
    {
        require(shares > 0, "KWVault: zero shares");
        
        assets = previewMint(shares);
        require(assets > 0, "KWVault: zero assets");
        
        asset.safeTransferFrom(msg.sender, address(this), assets);
        totalAssets += assets;
        _mint(receiver, shares);
        
        emit Deposit(msg.sender, receiver, assets, shares);
        
        return assets;
    }
    
    function withdraw(uint256 assets, address receiver, address owner) 
        public 
        override 
        nonReentrant 
        returns (uint256 shares) 
    {
        require(assets > 0, "KWVault: zero assets");
        require(block.timestamp >= lastWithdrawTime[owner] + withdrawCooldown, "KWVault: cooldown active");
        
        shares = previewWithdraw(assets);
        
        if (msg.sender != owner) {
            _spendAllowance(owner, msg.sender, shares);
        }
        
        _burn(owner, shares);
        totalAssets -= assets;
        lastWithdrawTime[owner] = block.timestamp;
        
        asset.safeTransfer(receiver, assets);
        
        emit Withdraw(msg.sender, receiver, owner, assets, shares);
        
        return shares;
    }
    
    function redeem(uint256 shares, address receiver, address owner) 
        public 
        override 
        nonReentrant 
        returns (uint256 assets) 
    {
        require(shares > 0, "KWVault: zero shares");
        require(block.timestamp >= lastWithdrawTime[owner] + withdrawCooldown, "KWVault: cooldown active");
        
        if (msg.sender != owner) {
            _spendAllowance(owner, msg.sender, shares);
        }
        
        assets = previewRedeem(shares);
        _burn(owner, shares);
        totalAssets -= assets;
        lastWithdrawTime[owner] = block.timestamp;
        
        asset.safeTransfer(receiver, assets);
        
        emit Withdraw(msg.sender, receiver, owner, assets, shares);
        
        return assets;
    }
    
    // AI-driven rebalancing
    function rebalance(uint256 newHedgeRatio) external onlyOwner {
        require(newHedgeRatio <= 10000, "KWVault: invalid hedge ratio");
        
        uint256 ratioChange = newHedgeRatio > hedgeRatio ? 
            newHedgeRatio - hedgeRatio : hedgeRatio - newHedgeRatio;
        
        require(ratioChange >= rebalanceThreshold, "KWVault: threshold not met");
        
        hedgeRatio = newHedgeRatio;
        
        emit Rebalance(newHedgeRatio, block.timestamp);
    }
    
    // Emergency functions
    function emergencyWithdraw() external nonReentrant {
        uint256 shares = balanceOf(msg.sender);
        require(shares > 0, "KWVault: no shares");
        
        uint256 assets = _convertToAssets(shares, Math.Rounding.Floor);
        _burn(msg.sender, shares);
        totalAssets -= assets;
        
        // Apply emergency fee (5%)
        uint256 emergencyFee = (assets * 500) / 10000;
        uint256 withdrawAmount = assets - emergencyFee;
        
        asset.safeTransfer(msg.sender, withdrawAmount);
        
        emit EmergencyWithdraw(msg.sender, withdrawAmount);
    }
    
    // zkMe integration
    function setZkMeVerification(address user, bool verified) external onlyOwner {
        zkMeVerified[user] = verified;
        emit ZkMeVerification(user, verified);
    }
    
    // Cross-chain bridge authorization
    function authorizeBridge(address bridge, bool authorized) external onlyOwner {
        authorizedBridges[bridge] = authorized;
    }
    
    // SocialFi and gaming functions
    function completeMission(address user, string calldata mission, uint256 points) external onlyOwner {
        missionPoints[user] += points;
        uint256 kwReward = points * 10; // 10 KW tokens per point
        kwTokenRewards[user] += kwReward;
        totalKWTokens += kwReward;
        
        emit MissionCompleted(user, mission, points);
        emit KWTokensEarned(user, kwReward);
    }
    
    function claimKWTokens() external {
        uint256 reward = kwTokenRewards[msg.sender];
        require(reward > 0, "KWVault: no rewards");
        
        kwTokenRewards[msg.sender] = 0;
        // Transfer KW tokens (implementation depends on KW token contract)
        
        emit KWTokensEarned(msg.sender, reward);
    }
    
    // Admin functions
    function setFees(uint256 _performanceFee, uint256 _managementFee) external onlyOwner {
        require(_performanceFee <= 2000, "KWVault: performance fee too high"); // Max 20%
        require(_managementFee <= 500, "KWVault: management fee too high"); // Max 5%
        
        performanceFee = _performanceFee;
        managementFee = _managementFee;
    }
    
    function setTargetAPY(uint256 _targetAPY) external onlyOwner {
        targetAPY = _targetAPY;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Internal helper functions
    function _convertToShares(uint256 assets, Math.Rounding rounding) internal view returns (uint256) {
        return assets.mulDiv(totalSupply() + 10 ** _decimalsOffset(), totalAssets + 1, rounding);
    }
    
    function _convertToAssets(uint256 shares, Math.Rounding rounding) internal view returns (uint256) {
        return shares.mulDiv(totalAssets + 1, totalSupply() + 10 ** _decimalsOffset(), rounding);
    }
    
    function _decimalsOffset() internal pure returns (uint8) {
        return 0;
    }
    
    // View functions for frontend
    function getVaultStats() external view returns (
        uint256 _totalAssets,
        uint256 _totalShares,
        uint256 _targetAPY,
        uint256 _hedgeRatio,
        uint256 _performanceFee,
        uint256 _managementFee
    ) {
        return (
            totalAssets,
            totalSupply(),
            targetAPY,
            hedgeRatio,
            performanceFee,
            managementFee
        );
    }
    
    function getUserStats(address user) external view returns (
        uint256 shares,
        uint256 assets,
        uint256 kwRewards,
        uint256 missions,
        bool zkVerified,
        uint256 lastWithdraw
    ) {
        return (
            balanceOf(user),
            _convertToAssets(balanceOf(user), Math.Rounding.Floor),
            kwTokenRewards[user],
            missionPoints[user],
            zkMeVerified[user],
            lastWithdrawTime[user]
        );
    }
}
