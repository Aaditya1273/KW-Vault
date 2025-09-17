import Database from 'better-sqlite3'
import path from 'path'

// SQLite database instance
let db: Database.Database | null = null

// Initialize database with tables
function initializeDatabase() {
  if (db) return db

  const dbPath = path.join(process.cwd(), 'data', 'kw-vault.db')
  
  try {
    // Create data directory if it doesn't exist
    const fs = require('fs')
    const dataDir = path.dirname(dbPath)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    db = new Database(dbPath)
    
    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL')
    db.pragma('synchronous = NORMAL')
    db.pragma('cache_size = 1000000')
    db.pragma('temp_store = memory')

    // Create tables
    createTables()
    
    console.log('✅ SQLite database initialized successfully')
    return db
  } catch (error) {
    console.error('❌ Failed to initialize SQLite database:', error)
    throw error
  }
}

function createTables() {
  if (!db) throw new Error('Database not initialized')

  // Users table for SocialFi
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      address TEXT PRIMARY KEY,
      kwTokenBalance REAL DEFAULT 0,
      totalDeposited REAL DEFAULT 0,
      missionsCompleted INTEGER DEFAULT 0,
      rank INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Vault stats cache
  db.exec(`
    CREATE TABLE IF NOT EXISTS vault_stats_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      data TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // AI predictions cache
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_predictions_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      data TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Bridge transactions
  db.exec(`
    CREATE TABLE IF NOT EXISTS bridge_transactions (
      txHash TEXT PRIMARY KEY,
      fromChain TEXT NOT NULL,
      toChain TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      userAddress TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create indexes for better performance
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_address ON users(address)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_vault_cache_type ON vault_stats_cache(type)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_ai_cache_type ON ai_predictions_cache(type)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_bridge_status ON bridge_transactions(status)`)
}

// Database operations interface
export interface DatabaseOperations {
  // Users
  findUser: (address: string) => any
  createUser: (userData: any) => any
  updateUser: (address: string, userData: any) => any
  
  // Cache operations
  getCache: (type: string, table: string) => any
  setCache: (type: string, data: any, table: string) => void
  
  // Bridge transactions
  findBridgeTransaction: (txHash: string) => any
  createBridgeTransaction: (txData: any) => any
  updateBridgeTransaction: (txHash: string, updates: any) => any
}

export function getDatabase(): DatabaseOperations {
  const database = initializeDatabase()
  
  return {
    // User operations
    findUser: (address: string) => {
      const stmt = database.prepare('SELECT * FROM users WHERE address = ?')
      return stmt.get(address)
    },

    createUser: (userData: any) => {
      const stmt = database.prepare(`
        INSERT INTO users (address, kwTokenBalance, totalDeposited, missionsCompleted, rank)
        VALUES (?, ?, ?, ?, ?)
      `)
      return stmt.run(
        userData.address,
        userData.kwTokenBalance || 0,
        userData.totalDeposited || 0,
        userData.missionsCompleted || 0,
        userData.rank || 1
      )
    },

    updateUser: (address: string, userData: any) => {
      const stmt = database.prepare(`
        UPDATE users 
        SET kwTokenBalance = ?, totalDeposited = ?, missionsCompleted = ?, rank = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE address = ?
      `)
      return stmt.run(
        userData.kwTokenBalance,
        userData.totalDeposited,
        userData.missionsCompleted,
        userData.rank,
        address
      )
    },

    // Cache operations
    getCache: (type: string, table: string) => {
      const stmt = database.prepare(`SELECT * FROM ${table} WHERE type = ? ORDER BY timestamp DESC LIMIT 1`)
      const result = stmt.get(type) as any
      return result ? { ...result, data: JSON.parse(result.data) } : null
    },

    setCache: (type: string, data: any, table: string) => {
      const stmt = database.prepare(`
        INSERT OR REPLACE INTO ${table} (type, data, timestamp)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `)
      stmt.run(type, JSON.stringify(data))
    },

    // Bridge transaction operations
    findBridgeTransaction: (txHash: string) => {
      const stmt = database.prepare('SELECT * FROM bridge_transactions WHERE txHash = ?')
      return stmt.get(txHash)
    },

    createBridgeTransaction: (txData: any) => {
      const stmt = database.prepare(`
        INSERT INTO bridge_transactions (txHash, fromChain, toChain, amount, status, userAddress)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      return stmt.run(
        txData.txHash,
        txData.fromChain,
        txData.toChain,
        txData.amount,
        txData.status || 'pending',
        txData.userAddress
      )
    },

    updateBridgeTransaction: (txHash: string, updates: any) => {
      const stmt = database.prepare(`
        UPDATE bridge_transactions 
        SET status = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE txHash = ?
      `)
      return stmt.run(updates.status, txHash)
    }
  }
}

// Cleanup function
export function closeDatabase() {
  if (db) {
    db.close()
    db = null
    console.log('✅ SQLite database connection closed')
  }
}

// Handle process termination
process.on('exit', closeDatabase)
process.on('SIGINT', closeDatabase)
process.on('SIGTERM', closeDatabase)
