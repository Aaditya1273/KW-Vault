import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/sqlite"
import { UserDataSchema } from "@/lib/types"

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params

    // Validate address format
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: "Invalid Ethereum address format" },
        { status: 400 }
      )
    }

    const db = getDatabase()
    const user = db.findUser(address)

    if (!user) {
      // Create default user data for new users
      const defaultUser = {
        address,
        kwTokenBalance: 0,
        totalDeposited: 0,
        missionsCompleted: 0,
        rank: 1, // Minimum rank is 1 according to schema
      }
      
      // Save to database
      db.createUser(defaultUser)
      
      return NextResponse.json(UserDataSchema.parse(defaultUser))
    }

    // Validate and return user data
    const userData = {
      address: user.address,
      kwTokenBalance: user.kwTokenBalance || 0,
      totalDeposited: user.totalDeposited || 0,
      missionsCompleted: user.missionsCompleted || 0,
      rank: user.rank && user.rank >= 1 ? user.rank : 1,
    }

    const validatedUser = UserDataSchema.parse(userData)
    return NextResponse.json(validatedUser)
  } catch (error) {
    console.error("Error fetching user data:", error)
    
    // Return default user as fallback
    const fallbackUser = {
      address: params.address,
      kwTokenBalance: 0,
      totalDeposited: 0,
      missionsCompleted: 0,
      rank: 1,
    }
    
    return NextResponse.json(fallbackUser)
  }
}