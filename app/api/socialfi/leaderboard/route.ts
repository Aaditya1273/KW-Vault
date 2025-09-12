import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    const leaderboard = await db
      .collection("users")
      .find({})
      .sort({ kwTokenBalance: -1 })
      .limit(100)
      .project({
        address: 1,
        kwTokenBalance: 1,
        totalDeposited: 1,
        missionsCompleted: 1,
        rank: 1,
        avatar: 1,
        username: 1,
      })
      .toArray()

    // Add rank numbers
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1,
    }))

    return NextResponse.json(rankedLeaderboard)
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { address, kwTokens, action } = await request.json()
    const { db } = await connectToDatabase()

    // Update user KW token balance
    await db.collection("users").updateOne(
      { address },
      {
        $inc: { kwTokenBalance: kwTokens },
        $push: {
          activities: {
            action,
            tokens: kwTokens,
            timestamp: new Date(),
          },
        },
        $setOnInsert: {
          address,
          totalDeposited: 0,
          missionsCompleted: 0,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user tokens:", error)
    return NextResponse.json({ error: "Failed to update tokens" }, { status: 500 })
  }
}
