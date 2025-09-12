const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("KWVault", () => {
  let kwVault, kwToken, mockUSDT
  let owner, user1, user2

  beforeEach(async () => {
    ;[owner, user1, user2] = await ethers.getSigners()

    // Deploy mock USDT
    const MockERC20 = await ethers.getContractFactory("MockERC20")
    mockUSDT = await MockERC20.deploy("Mock USDT", "USDT", 6)

    // Deploy KW Token
    const KWToken = await ethers.getContractFactory("KWToken")
    kwToken = await KWToken.deploy()

    // Deploy KW Vault
    const KWVault = await ethers.getContractFactory("KWVault")
    kwVault = await KWVault.deploy(await mockUSDT.getAddress(), "KW Vault Shares", "kwUSDT")

    // Setup minter role
    await kwToken.addMinter(await kwVault.getAddress())

    // Mint some USDT to users
    await mockUSDT.mint(user1.address, ethers.parseUnits("1000", 6))
    await mockUSDT.mint(user2.address, ethers.parseUnits("1000", 6))
  })

  describe("Deployment", () => {
    it("Should set the right asset", async () => {
      expect(await kwVault.asset()).to.equal(await mockUSDT.getAddress())
    })

    it("Should set the right owner", async () => {
      expect(await kwVault.owner()).to.equal(owner.address)
    })
  })

  describe("Deposits", () => {
    it("Should allow deposits and mint shares", async () => {
      const depositAmount = ethers.parseUnits("100", 6)

      await mockUSDT.connect(user1).approve(await kwVault.getAddress(), depositAmount)
      await kwVault.connect(user1).deposit(depositAmount, user1.address)

      expect(await kwVault.balanceOf(user1.address)).to.be.gt(0)
      expect(await kwVault.totalAssets()).to.equal(depositAmount)
    })

    it("Should award KW tokens on deposit", async () => {
      const depositAmount = ethers.parseUnits("100", 6)

      await mockUSDT.connect(user1).approve(await kwVault.getAddress(), depositAmount)
      await kwVault.connect(user1).deposit(depositAmount, user1.address)

      const [, , kwRewards] = await kwVault.getUserStats(user1.address)
      expect(kwRewards).to.be.gt(0)
    })
  })

  describe("Withdrawals", () => {
    beforeEach(async () => {
      const depositAmount = ethers.parseUnits("100", 6)
      await mockUSDT.connect(user1).approve(await kwVault.getAddress(), depositAmount)
      await kwVault.connect(user1).deposit(depositAmount, user1.address)
    })

    it("Should allow withdrawals after cooldown", async () => {
      // Fast forward time to bypass cooldown
      await ethers.provider.send("evm_increaseTime", [3600]) // 1 hour
      await ethers.provider.send("evm_mine")

      const shares = await kwVault.balanceOf(user1.address)
      await kwVault.connect(user1).redeem(shares, user1.address, user1.address)

      expect(await kwVault.balanceOf(user1.address)).to.equal(0)
    })
  })

  describe("Emergency Withdraw", () => {
    it("Should allow emergency withdraw with fee", async () => {
      const depositAmount = ethers.parseUnits("100", 6)
      await mockUSDT.connect(user1).approve(await kwVault.getAddress(), depositAmount)
      await kwVault.connect(user1).deposit(depositAmount, user1.address)

      const balanceBefore = await mockUSDT.balanceOf(user1.address)
      await kwVault.connect(user1).emergencyWithdraw()
      const balanceAfter = await mockUSDT.balanceOf(user1.address)

      // Should receive less than deposited due to emergency fee
      expect(balanceAfter - balanceBefore).to.be.lt(depositAmount)
    })
  })
})
