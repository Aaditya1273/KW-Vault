
"use client"

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/theme-provider"
import { useState } from "react"
import { wagmiConfig } from '@/lib/wagmi-config'

/**
 * 🌟 CLEAN WAGMI PROVIDERS
 * RainbowKit-free setup for Kaia ecosystem
 * Optimized for hackathon development
 */


interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // 🚀 Optimized QueryClient for DeFi applications
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute - fresh data for DeFi
        gcTime: 1000 * 60 * 60 * 24, // 24 hours cache (React Query v5)
        retry: (failureCount, error: any) => {
          // Smart retry for blockchain queries
          if (failureCount < 3) {
            const errorMessage = error?.message?.toLowerCase() || ''
            // Retry network issues, not RPC errors
            if (errorMessage.includes('fetch') || 
                errorMessage.includes('network') || 
                errorMessage.includes('timeout')) {
              return true
            }
          }
          return false
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
        onError: (error) => {
          console.error('Mutation error:', error)
        },
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}

/**
 * 🎯 WALLET DETECTION UTILITIES
 * Helper functions for Kaia ecosystem wallets
 */

// Check if Kaia wallet is available
export const isKaiaWalletAvailable = (): boolean => {
  if (typeof window === 'undefined') return false
  return Boolean((window as any)?.kaia) || 
         (Boolean((window as any)?.klaytn) && !(window as any)?.klaytn?.isCryptoCom)
}

// Get Kaia provider instance
export const getKaiaProvider = () => {
  if (typeof window === 'undefined') return null
  
  // Prefer new Kaia provider
  if ((window as any)?.kaia) {
    return (window as any).kaia
  }
  
  // Fallback to Klaytn provider (avoiding Crypto.com conflict)
  if ((window as any)?.klaytn && !(window as any)?.klaytn?.isCryptoCom) {
    return (window as any).klaytn
  }
  
  return null
}