const { MongoClient } = require("mongodb")
require("dotenv").config()

async function setupDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    console.log("📊 Connected to MongoDB")

    const db = client.db(process.env.MONGODB_DB || "kw_vault")

    // Create collections and indexes
    const collections = [
      {
        name: "users",
        indexes: [
          { key: { address: 1 }, options: { unique: true } },
          { key: { kwTokenBalance: -1 } },
          { key: { totalDeposited: -1 } },
        ],
      },
      {
        name: "vault_stats_cache",
        indexes: [{ key: { timestamp: 1 }, options: { expireAfterSeconds: 60 } }, { key: { type: 1 } }],
      },
      {
        name: "ai_predictions_cache",
        indexes: [{ key: { timestamp: 1 }, options: { expireAfterSeconds: 60 } }, { key: { type: 1 } }],
      },
      {
        name: "bridge_transactions",
        indexes: [
          { key: { txHash: 1 }, options: { unique: true } },
          { key: { userAddress: 1 } },
          { key: { status: 1 } },
        ],
      },
      {
        name: "missions",
        indexes: [{ key: { userId: 1, missionId: 1 }, options: { unique: true } }, { key: { completedAt: 1 } }],
      },
    ]

    for (const collection of collections) {
      console.log(`📋 Setting up collection: ${collection.name}`)

      // Create collection if it doesn't exist
      const collectionExists = await db.listCollections({ name: collection.name }).hasNext()
      if (!collectionExists) {
        await db.createCollection(collection.name)
      }

      // Create indexes
      for (const index of collection.indexes) {
        await db.collection(collection.name).createIndex(index.key, index.options || {})
        console.log(`  ✅ Created index: ${JSON.stringify(index.key)}`)
      }
    }

    // Insert sample data for development
    if (process.env.NODE_ENV === "development") {
      console.log("🌱 Seeding development data...")

      // Sample users
      await db
        .collection("users")
        .insertMany(
          [
            {
              address: "0x1234567890123456789012345678901234567890",
              kwTokenBalance: 1500,
              totalDeposited: 5000,
              missionsCompleted: 3,
              completedMissions: ["first_deposit", "deposit_1000", "cross_chain"],
              createdAt: new Date(),
            },
            {
              address: "0x0987654321098765432109876543210987654321",
              kwTokenBalance: 2500,
              totalDeposited: 10000,
              missionsCompleted: 4,
              completedMissions: ["first_deposit", "deposit_1000", "hold_30_days", "refer_friend"],
              createdAt: new Date(),
            },
          ],
          { ordered: false },
        )
        .catch(() => {}) // Ignore duplicate key errors
    }

    console.log("✅ Database setup complete!")
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

setupDatabase()
