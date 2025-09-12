import { ethers } from "ethers"

// Contract ABIs (simplified for demo)
export const VAULT_ABI = [
  "function deposit(uint256 assets, address receiver) returns (uint256)",
  "function withdraw(uint256 assets, address receiver, address owner) returns (uint256)",
  "function totalAssets() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function getCurrentAPY() view returns (uint256)",
  "function getHedgeRatio() view returns (uint256)",
  "function getStrategyAllocation() view returns (uint256)",
  "function rebalance() external",
  "function emergencyWithdraw() external",
  "event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares)",
  "event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)",
]

export const KW_TOKEN_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount) external",
  "function totalSupply() view returns (uint256)",
]

export const USDT_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
]

// Contract addresses (will be set after deployment)
export const CONTRACT_ADDRESSES = {
  VAULT: process.env.VAULT_CONTRACT_ADDRESS || "",
  KW_TOKEN: process.env.KW_TOKEN_CONTRACT_ADDRESS || "",
  USDT: "0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A", // Kaia testnet USDT
}

// Provider setup
export function getProvider() {
  return new ethers.JsonRpcProvider(process.env.KAIA_RPC_URL)
}

export function getSigner() {
  const provider = getProvider()
  return new ethers.Wallet(process.env.PRIVATE_KEY!, provider)
}

// Contract instances
export function getVaultContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const providerOrSigner = signerOrProvider || getProvider()
  return new ethers.Contract(CONTRACT_ADDRESSES.VAULT, VAULT_ABI, providerOrSigner)
}

export function getKWTokenContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const providerOrSigner = signerOrProvider || getProvider()
  return new ethers.Contract(CONTRACT_ADDRESSES.KW_TOKEN, KW_TOKEN_ABI, providerOrSigner)
}

export function getUSDTContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const providerOrSigner = signerOrProvider || getProvider()
  return new ethers.Contract(CONTRACT_ADDRESSES.USDT, USDT_ABI, providerOrSigner)
}
