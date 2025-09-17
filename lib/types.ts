// Data validation schemas and types for KW Vault
import { z } from 'zod'

// Vault Statistics Schema
export const VaultStatsSchema = z.object({
  tvl: z.string().transform((val) => parseFloat(val)),
  totalShares: z.string().transform((val) => parseFloat(val)),
  currentAPY: z.number().min(0).max(100),
  hedgeRatio: z.number().min(0).max(100),
  strategyInvestment: z.string().transform((val) => parseFloat(val)),
  lastUpdated: z.string().datetime(),
})

export type VaultStats = z.infer<typeof VaultStatsSchema>

// AI Predictions Schema
export const AIPredictionsSchema = z.object({
  predictions: z.array(z.object({
    timestamp: z.string().datetime(),
    predictedAPY: z.number().min(0).max(100),
    confidence: z.number().min(0).max(1),
    riskScore: z.number().min(0).max(10),
  })),
  rebalanceRecommendation: z.object({
    shouldRebalance: z.boolean(),
    reason: z.string(),
    suggestedAllocation: z.record(z.number()),
  }),
  marketAnalysis: z.object({
    trend: z.enum(['bullish', 'bearish', 'neutral']),
    volatility: z.number().min(0).max(100),
    riskLevel: z.enum(['low', 'medium', 'high']),
  }),
})

export type AIPredictions = z.infer<typeof AIPredictionsSchema>

// User Data Schema
export const UserDataSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  kwTokenBalance: z.number().min(0),
  totalDeposited: z.number().min(0),
  missionsCompleted: z.number().min(0),
  rank: z.number().min(1).optional(),
  avatar: z.string().url().optional(),
  username: z.string().optional(),
})

export type UserData = z.infer<typeof UserDataSchema>

// Bridge Status Schema
export const BridgeStatusSchema = z.object({
  txHash: z.string(),
  status: z.enum(['pending', 'completed', 'failed']),
  fromChain: z.string(),
  toChain: z.string(),
  amount: z.string(),
  token: z.string(),
  estimatedTime: z.number().optional(),
  confirmations: z.number().optional(),
})

export type BridgeStatus = z.infer<typeof BridgeStatusSchema>

// API Response wrapper
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    timestamp: z.string().datetime(),
  })

export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

// Environment variables validation
export const EnvSchema = z.object({
  KAIA_RPC_URL: z.string().url(),
  VAULT_CONTRACT_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  MONGODB_URI: z.string().url(),
  AI_API_URL: z.string().url(),
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().min(1),
})

export type EnvConfig = z.infer<typeof EnvSchema>
