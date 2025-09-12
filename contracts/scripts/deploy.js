const { ethers } = require("hardhat")
const hre = require("hardhat") // Declare hre variable

async function main() {
  console.log("Deploying KW Vault contracts...")

  // Get the deployer account
  const [deployer] = await ethers.getSigners()
  console.log("Deploying contracts with account:", deployer.address)

  // Deploy KW Token first
  const KWToken = await ethers.getContractFactory("KWToken")
  const kwToken = await KWToken.deploy()
  await kwToken.waitForDeployment()
  console.log("KW Token deployed to:", await kwToken.getAddress())

  // Deploy KW Vault
  // Using USDT address on Kaia (you'll need to update this with actual USDT address)
  const usdtAddress = "0x0000000000000000000000000000000000000000" // Placeholder

  const KWVault = await ethers.getContractFactory("KWVault")
  const kwVault = await KWVault.deploy(usdtAddress, "KW Vault Shares", "kwUSDT")
  await kwVault.waitForDeployment()
  console.log("KW Vault deployed to:", await kwVault.getAddress())

  // Set KW Vault as minter for KW Token
  await kwToken.addMinter(await kwVault.getAddress())
  console.log("KW Vault added as minter for KW Token")

  // Save deployment addresses
  const deploymentInfo = {
    kwToken: await kwToken.getAddress(),
    kwVault: await kwVault.getAddress(),
    deployer: deployer.address,
    network: hre.network.name,
    timestamp: new Date().toISOString(),
  }

  console.log("Deployment completed:", deploymentInfo)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
