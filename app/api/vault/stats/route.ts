import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ethers } from "ethers"

// Cache TTL: 10 seconds as specified
const CACHE_TTL = 10 * 1000

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    // Check cache first
    const cached = await db.collection("vault_stats_cache").findOne({
      type: "vault_stats",
      timestamp: { $gt: new Date(Date.now() - CACHE_TTL) },
    })

    if (cached) {
      return NextResponse.json(cached.data)
    }

    // Fetch fresh data from blockchain
    const provider = new ethers.JsonRpcProvider(process.env.KAIA_RPC_URL)
    const vaultContract = new ethers.Contract(
      process.env.VAULT_CONTRACT_ADDRESS!,
      [
        "function totalAssets() view returns (uint256)",
        "function totalSupply() view returns (uint256)",
        "function getCurrentAPY() view returns (uint256)",
        "function getHedgeRatio() view returns (uint256)",
        "function getStrategyAllocation() view returns (uint256)",
      ],
      provider,
    )

    const [totalAssets, totalSupply, currentAPY, hedgeRatio, strategyAllocation] = await Promise.all([
      vaultContract.totalAssets(),
      vaultContract.totalSupply(),
      vaultContract.getCurrentAPY(),
      vaultContract.getHedgeRatio(),
      vaultContract.getStrategyAllocation(),
    ])

    const stats = {
      tvl: ethers.formatUnits(totalAssets, 6), // USDT has 6 decimals
      totalShares: ethers.formatEther(totalSupply),
      currentAPY: Number(currentAPY) / 100, // Convert from basis points
      hedgeRatio: Number(hedgeRatio) / 100,
      strategyInvestment: ethers.formatUnits(strategyAllocation, 6),
      lastUpdated: new Date().toISOString(),
    }

    // Cache the result
    await db.collection("vault_stats_cache").replaceOne(
      { type: "vault_stats" },
      {
        type: "vault_stats",
        data: stats,
        timestamp: new Date(),
      },
      { upsert: true },
    )

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching vault stats:", error)
    return NextResponse.json({ error: "Failed to fetch vault stats" }, { status: 500 })
  }
}
