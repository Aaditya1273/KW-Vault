// Production-grade API client with error handling and validation
import { useState, useEffect, useCallback, DependencyList } from 'react'
import { VaultStatsSchema, AIPredictionsSchema, UserDataSchema, BridgeStatusSchema, ApiResponse } from './types'
import type { VaultStats, AIPredictions, UserData, BridgeStatus } from './types'

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    validator?: (data: unknown) => T
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code
        )
      }

      const data = await response.json()

      if (validator) {
        return validator(data)
      }

      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      // Network or parsing errors
      throw new ApiError(
        `Failed to fetch ${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0
      )
    }
  }

  async getVaultStats(): Promise<VaultStats> {
    return this.request('/vault/stats', {}, (data) => VaultStatsSchema.parse(data))
  }

  async getAIPredictions(): Promise<AIPredictions> {
    return this.request('/ai/predictions', {}, (data) => AIPredictionsSchema.parse(data))
  }

  async getUserData(address: string): Promise<UserData> {
    return this.request(`/socialfi/user/${address}`, {}, (data) => UserDataSchema.parse(data))
  }

  async getLeaderboard(): Promise<UserData[]> {
    return this.request('/socialfi/leaderboard', {}, (data) => {
      if (!Array.isArray(data)) {
        throw new Error('Expected array response for leaderboard')
      }
      return data.map(user => UserDataSchema.parse(user))
    })
  }

  async getBridgeStatus(txHash: string): Promise<BridgeStatus> {
    return this.request(`/bridge/status/${txHash}`, {}, (data) => BridgeStatusSchema.parse(data))
  }

  async updateUserTokens(address: string, tokens: number, action: string): Promise<void> {
    await this.request('/socialfi/leaderboard', {
      method: 'POST',
      body: JSON.stringify({ address, kwTokens: tokens, action }),
    })
  }

  async completeMission(address: string, missionId: string): Promise<void> {
    await this.request('/socialfi/missions', {
      method: 'POST',
      body: JSON.stringify({ address, missionId }),
    })
  }
}

// Singleton instance
export const apiClient = new ApiClient()

// Hook for React components with error handling

export function useApiCall<T>(
  apiCall: () => Promise<T>,
  dependencies: DependencyList = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiCall()
        
        if (!cancelled) {
          setData(result)
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage = err instanceof ApiError 
            ? err.message 
            : 'An unexpected error occurred'
          setError(errorMessage)
          console.error('API call failed:', err)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, dependencies)

  const refetch = useCallback(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiCall()
        setData(result)
      } catch (err) {
        const errorMessage = err instanceof ApiError 
          ? err.message 
          : 'An unexpected error occurred'
        setError(errorMessage)
        console.error('API call failed:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, dependencies)

  return { data, loading, error, refetch }
}

export { ApiError }
