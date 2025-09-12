import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const txHash = searchParams.get("txHash")

    if (!txHash) {
      return NextResponse.json({ error: "Transaction hash required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check bridge transaction status
    const bridgeTx = await db.collection("bridge_transactions").findOne({ txHash })

    if (!bridgeTx) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Simulate bridge status check (in real implementation, query Allbridge API)
    const status = {
      txHash,
      status: bridgeTx.status || "pending",
      sourceChain: bridgeTx.sourceChain,
      targetChain: bridgeTx.targetChain,
      amount: bridgeTx.amount,
      estimatedTime: "5-10 minutes",
      confirmations: bridgeTx.confirmations || 0,
      requiredConfirmations: 12,
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("Error checking bridge status:", error)
    return NextResponse.json({ error: "Failed to check bridge status" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { txHash, sourceChain, targetChain, amount, userAddress } = await request.json()
    const { db } = await connectToDatabase()

    // Record bridge transaction
    await db.collection("bridge_transactions").insertOne({
      txHash,
      sourceChain,
      targetChain,
      amount,
      userAddress,
      status: "pending",
      confirmations: 0,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error recording bridge transaction:", error)
    return NextResponse.json({ error: "Failed to record transaction" }, { status: 500 })
  }
}
