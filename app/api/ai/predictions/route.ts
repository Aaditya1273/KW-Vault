import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/sqlite"
import { AIPredictionsSchema } from "@/lib/types"

const AI_API_URL = process.env.AI_API_URL || "http://localhost:5000"
const CACHE_TTL = 10 * 1000 // 10 seconds

// Mock AI predictions for development
function getMockPredictions() {
  return {
    predictions: [
      {
        timeframe: "7d",
        predicted_apy: 12.5,
        confidence: 0.85,
        risk_level: "medium",
        rebalancing_suggestions: [
          {
            action: "increase",
            asset: "KAIA",
            percentage: 5,
            reason: "Strong momentum indicators"
          }
        ]
      }
    ],
    market_analysis: {
      trend: "bullish",
      volatility: "low",
      sentiment_score: 0.75
    },
    timestamp: new Date().toISOString()
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase()

    // Check cache first
    const cached = db.getCache("ai_predictions", "ai_predictions_cache")
    
    if (cached && new Date(cached.timestamp).getTime() > Date.now() - CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    // Try to fetch from AI API, fallback to mock data
    let predictions
    
    if (process.env.AI_API_URL && process.env.AI_API_URL.startsWith('http')) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

        const response = await fetch(`${process.env.AI_API_URL}/predict`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "User-Agent": "KW-Vault/1.0"
          },
          body: JSON.stringify({
            timeframe: "7d",
            include_rebalancing: true,
            market_data: {
              timestamp: new Date().toISOString(),
              source: "kaia-network"
            }
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          predictions = await response.json()
        } else {
          throw new Error(`AI API returned ${response.status}`)
        }
      } catch (fetchError) {
        console.log("AI API unavailable, using mock data:", fetchError instanceof Error ? fetchError.message : "Unknown error")
        predictions = getMockPredictions()
      }
    } else {
      console.log("AI_API_URL not configured, using mock data")
      predictions = getMockPredictions()
    }

    // Cache the result
    db.setCache("ai_predictions", predictions, "ai_predictions_cache")

    return NextResponse.json(predictions)
  } catch (error) {
    console.error("Error in AI predictions API:", error)
    
    // Return mock data as fallback
    return NextResponse.json(getMockPredictions())
  }
}
