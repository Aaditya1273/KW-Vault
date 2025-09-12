import { MongoClient, type Db } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI!
const MONGODB_DB = process.env.MONGODB_DB || "kw_vault"

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = new MongoClient(MONGODB_URI)
  await client.connect()

  const db = client.db(MONGODB_DB)

  // Create indexes for better performance
  await Promise.all([
    db.collection("users").createIndex({ address: 1 }, { unique: true }),
    db.collection("users").createIndex({ kwTokenBalance: -1 }),
    db.collection("vault_stats_cache").createIndex({ timestamp: 1 }, { expireAfterSeconds: 60 }),
    db.collection("ai_predictions_cache").createIndex({ timestamp: 1 }, { expireAfterSeconds: 60 }),
    db.collection("bridge_transactions").createIndex({ txHash: 1 }, { unique: true }),
    db.collection("bridge_transactions").createIndex({ userAddress: 1 }),
  ])

  cachedClient = client
  cachedDb = db

  return { client, db }
}
