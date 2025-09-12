import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

const AI_API_URL = process.env.AI_API_URL || "http://localhost:5000"
const CACHE_TTL = 10 * 1000 // 10 seconds

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    // Check cache first
    const cached = await db.collection("ai_predictions_cache").findOne({
      type: "ai_predictions",
      timestamp: { $gt: new Date(Date.now() - CACHE_TTL) },
    })

    if (cached) {
      return NextResponse.json(cached.data)
    }

    // Fetch fresh AI predictions
    const response = await fetch(`${AI_API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timeframe: "7d",
        include_rebalancing: true,
      }),
    })

    if (!response.ok) {
      throw new Error("AI API request failed")
    }

    const predictions = await response.json()

    // Cache the result
    await db.collection("ai_predictions_cache").replaceOne(
      { type: "ai_predictions" },
      {
        type: "ai_predictions",
        data: predictions,
        timestamp: new Date(),
      },
      { upsert: true },
    )

    return NextResponse.json(predictions)
  } catch (error) {
    console.error("Error fetching AI predictions:", error)
    return NextResponse.json({ error: "Failed to fetch AI predictions" }, { status: 500 })
  }
}
