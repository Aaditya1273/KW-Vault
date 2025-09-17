// Environment variable validation for production deployment
import { z } from 'zod'

// Production environment schema
export const ProductionEnvSchema = z.object({
  // Database
  MONGODB_URI: z.string().url("Invalid MongoDB URI"),
  
  // Blockchain
  KAIA_RPC_URL: z.string().url("Invalid Kaia RPC URL"),
  VAULT_CONTRACT_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid contract address"),
  PRIVATE_KEY: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid private key").optional(),
  
  // AI Services
  AI_API_URL: z.string().url("Invalid AI API URL"),
  
  // External APIs
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().min(1, "WalletConnect project ID required"),
  ALLBRIDGE_API_KEY: z.string().min(1, "Allbridge API key required").optional(),
  ZKME_APP_ID: z.string().min(1, "zkMe app ID required").optional(),
  
  // Authentication
  NEXTAUTH_SECRET: z.string().min(32, "NextAuth secret must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url("Invalid NextAuth URL"),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export type ProductionEnv = z.infer<typeof ProductionEnvSchema>

// Validate environment variables
export function validateEnvironment(): ProductionEnv {
  try {
    return ProductionEnvSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n')
      throw new Error(`Environment validation failed:\n${missingVars}`)
    }
    throw error
  }
}

// Check if running in production
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

// Get required environment variables with validation
export function getRequiredEnv(key: keyof ProductionEnv): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`)
  }
  return value
}

// Get optional environment variables
export function getOptionalEnv(key: keyof ProductionEnv, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue
}
