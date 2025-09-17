import { MongoClient, Db } from "mongodb"

// Fallback to in-memory mock for development when MongoDB is not available
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/kw-vault"
const options = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  connectTimeoutMS: 5000,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Mock database for development when MongoDB is not available
const mockDb = {
  collection: (name: string) => ({
    findOne: async () => null,
    find: () => ({ toArray: async () => [] }),
    insertOne: async () => ({ insertedId: "mock-id" }),
    replaceOne: async () => ({ modifiedCount: 1 }),
    updateOne: async () => ({ modifiedCount: 1 }),
  })
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    const client = await clientPromise
    const db = client.db("kw-vault")
    return { client, db }
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    
    // Return mock database for development
    if (process.env.NODE_ENV === "development") {
      console.log("Using mock database for development")
      return { 
        client: null as any, 
        db: mockDb as any 
      }
    }
    
    throw error
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise
