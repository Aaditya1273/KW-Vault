import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    const { db } = await connectToDatabase()

    // Get user's completed missions
    const user = await db.collection("users").findOne({ address })
    const completedMissions = user?.completedMissions || []

    // Define available missions
    const missions = [
      {
        id: "first_deposit",
        title: "First Deposit",
        description: "Make your first deposit to KW Vault",
        reward: 100,
        type: "deposit",
        completed: completedMissions.includes("first_deposit"),
      },
      {
        id: "deposit_1000",
        title: "Big Depositor",
        description: "Deposit over 1,000 USDT",
        reward: 500,
        type: "deposit",
        completed: completedMissions.includes("deposit_1000"),
      },
      {
        id: "hold_30_days",
        title: "Diamond Hands",
        description: "Hold your position for 30 days",
        reward: 1000,
        type: "time",
        completed: completedMissions.includes("hold_30_days"),
      },
      {
        id: "refer_friend",
        title: "Bring a Friend",
        description: "Refer someone who deposits over 100 USDT",
        reward: 250,
        type: "social",
        completed: completedMissions.includes("refer_friend"),
      },
      {
        id: "cross_chain",
        title: "Cross-Chain Explorer",
        description: "Use the cross-chain bridge feature",
        reward: 300,
        type: "feature",
        completed: completedMissions.includes("cross_chain"),
      },
    ]

    return NextResponse.json(missions)
  } catch (error) {
    console.error("Error fetching missions:", error)
    return NextResponse.json({ error: "Failed to fetch missions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { address, missionId } = await request.json()
    const { db } = await connectToDatabase()

    // Mark mission as completed and award tokens
    const mission = {
      first_deposit: 100,
      deposit_1000: 500,
      hold_30_days: 1000,
      refer_friend: 250,
      cross_chain: 300,
    }[missionId]

    if (!mission) {
      return NextResponse.json({ error: "Invalid mission" }, { status: 400 })
    }

    await db.collection("users").updateOne(
      { address },
      {
        $addToSet: { completedMissions: missionId },
        $inc: {
          kwTokenBalance: mission,
          missionsCompleted: 1,
        },
        $push: {
          activities: {
            action: `Completed mission: ${missionId}`,
            tokens: mission,
            timestamp: new Date(),
          },
        },
      },
      { upsert: true },
    )

    return NextResponse.json({ success: true, reward: mission })
  } catch (error) {
    console.error("Error completing mission:", error)
    return NextResponse.json({ error: "Failed to complete mission" }, { status: 500 })
  }
}
