import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { UserDataSchema } from "@/lib/types"

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

    // Validate and transform data
    const validatedLeaderboard = leaderboard.map((user, index) => {
      const userData = {
        ...user,
        rank: index + 1,
        kwTokenBalance: user.kwTokenBalance || 0,
        totalDeposited: user.totalDeposited || 0,
        missionsCompleted: user.missionsCompleted || 0,
      }
      
      // Validate each user entry
      return UserDataSchema.parse(userData)
    })

    return NextResponse.json(validatedLeaderboard)
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json(
      { 
        error: "Failed to fetch leaderboard",
        details: errorMessage,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input data
    const { address, kwTokens, action } = body
    if (!address || typeof kwTokens !== 'number' || !action) {
      return NextResponse.json(
        { error: "Invalid input: address, kwTokens (number), and action are required" },
        { status: 400 }
      )
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: "Invalid Ethereum address format" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Update user KW token balance with proper typing
    const updateResult = await db.collection("users").updateOne(
      { address },
      {
        $inc: { kwTokenBalance: kwTokens },
        $push: {
          activities: {
            action: String(action),
            tokens: Number(kwTokens),
            timestamp: new Date(),
          } as any, // Type assertion to handle MongoDB typing issues
        },
        $setOnInsert: {
          address: String(address),
          totalDeposited: 0,
          missionsCompleted: 0,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    return NextResponse.json({ 
      success: true,
      modified: updateResult.modifiedCount > 0,
      upserted: updateResult.upsertedCount > 0,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error updating user tokens:", error)
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json(
      { 
        error: "Failed to update tokens",
        details: errorMessage,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}
