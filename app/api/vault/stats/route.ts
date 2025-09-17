import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/sqlite"
import { createPublicClient, http, formatUnits } from "viem"
import { kaiaTestnet } from "@/lib/wagmi-config"
import { VaultStatsSchema } from "@/lib/types"

// Cache TTL: 10 seconds as specified
const CACHE_TTL = 10 * 1000

// Mock vault stats for development
function getMockVaultStats() {
  return {
    tvl: "1250000.50",
    totalShares: "850000.25",
    currentAPY: 12.5,
    hedgeRatio: 0.75,
    strategyInvestment: "950000.00",
    lastUpdated: new Date().toISOString(),
  }
}

// Environment validation
const requiredEnvVars = {
  KAIA_RPC_URL: process.env.KAIA_RPC_URL,
  VAULT_CONTRACT_ADDRESS: process.env.VAULT_CONTRACT_ADDRESS,
}

function validateEnvironment() {
  const missing = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase()

    // Check cache first
    const cached = db.getCache("vault_stats", "vault_stats_cache")
    
    if (cached && new Date(cached.timestamp).getTime() > Date.now() - CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    // Try to fetch from blockchain, fallback to mock data
    let stats
    
    if (requiredEnvVars.VAULT_CONTRACT_ADDRESS && requiredEnvVars.KAIA_RPC_URL) {
      try {
        // Fetch fresh data from blockchain using viem
        const client = createPublicClient({
          chain: kaiaTestnet,
          transport: http(requiredEnvVars.KAIA_RPC_URL),
        })
        
        // Validate RPC connection
        await client.getChainId()

        // Validate contract exists
        const contractCode = await client.getBytecode({
          address: requiredEnvVars.VAULT_CONTRACT_ADDRESS! as `0x${string}`,
        })
        if (!contractCode || contractCode === "0x") {
          throw new Error("Vault contract not found at specified address")
        }

        const vaultAbi = [
          {
            name: "totalAssets",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ type: "uint256" }],
          },
          {
            name: "totalSupply",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ type: "uint256" }],
          },
          {
            name: "getCurrentAPY",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ type: "uint256" }],
          },
          {
            name: "getHedgeRatio",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ type: "uint256" }],
          },
          {
            name: "getStrategyAllocation",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ type: "uint256" }],
          },
        ] as const

        const contractAddress = requiredEnvVars.VAULT_CONTRACT_ADDRESS! as `0x${string}`
        const [totalAssets, totalSupply, currentAPY, hedgeRatio, strategyAllocation] = await Promise.all([
          client.readContract({ address: contractAddress, abi: vaultAbi, functionName: "totalAssets" }).catch(() => BigInt(0)),
          client.readContract({ address: contractAddress, abi: vaultAbi, functionName: "totalSupply" }).catch(() => BigInt(0)),
          client.readContract({ address: contractAddress, abi: vaultAbi, functionName: "getCurrentAPY" }).catch(() => BigInt(0)),
          client.readContract({ address: contractAddress, abi: vaultAbi, functionName: "getHedgeRatio" }).catch(() => BigInt(0)),
          client.readContract({ address: contractAddress, abi: vaultAbi, functionName: "getStrategyAllocation" }).catch(() => BigInt(0)),
        ])

        stats = {
          tvl: formatUnits(totalAssets as bigint, 6),
          totalShares: formatUnits(totalSupply as bigint, 18),
          currentAPY: Number(currentAPY) / 100,
          hedgeRatio: Number(hedgeRatio) / 100,
          strategyInvestment: formatUnits(strategyAllocation as bigint, 6),
          lastUpdated: new Date().toISOString(),
        }
      } catch (blockchainError) {
        console.log("Blockchain connection failed, using mock data:", blockchainError instanceof Error ? blockchainError.message : "Unknown error")
        stats = getMockVaultStats()
      }
    } else {
      console.log("Contract address or RPC URL not configured, using mock data")
      stats = getMockVaultStats()
    }

    // Cache the result
    db.setCache("vault_stats", stats, "vault_stats_cache")

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error in vault stats API:", error)
    
    // Return mock data as fallback
    return NextResponse.json(getMockVaultStats())
  }
}
