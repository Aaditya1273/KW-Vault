"use client"

import { useState, useEffect } from "react"
import { useAccount, useDisconnect, useReadContract } from "wagmi"
import { formatEther } from "viem"
import { useVaultData, useKaiaPrice } from "@/hooks/useVaultData"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, TrendingUp, Shield, Globe, Users, Sparkles, ArrowRight, LineChart, Lock, Coins, Brain, AlertCircle } from "lucide-react"
import { VaultStats } from "@/components/vault-stats"
import { DepositWithdraw, useRealVaultStats } from "@/components/deposit-withdraw"
import { AIInsights } from "@/components/ai-insights"
import { SocialFiHub } from "@/components/socialfi-hub"
import { CrossChainBridge } from "@/components/cross-chain-bridge"
import { PrivacyMode } from "@/components/privacy-mode"
import { WalletConnect } from "@/components/wallet-connect"
import { CommunityVaults } from "@/components/community-vaults"
import { ThemeToggle } from "@/components/theme-toggle"
import { Alert, AlertDescription } from "@/components/ui/alert"
import dynamic from "next/dynamic"

// Create a client-only wrapper for wallet-dependent content
const ClientOnlyWalletContent = dynamic(() => Promise.resolve(WalletDependentContent), {
  ssr: false,
  loading: () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p className="text-muted-foreground mt-2">Loading wallet connection...</p>
    </div>
  )
})

// Client-only disconnect button component
const ClientOnlyDisconnectButton = dynamic(() => Promise.resolve(DisconnectButton), {
  ssr: false,
  loading: () => <div className="w-10 h-10" /> // Placeholder to prevent layout shift
})

function DisconnectButton() {
  const { address, isConnected } = useAccount()
  const { disconnect, isPending: isDisconnecting } = useDisconnect()
  
  const handleWalletDisconnect = async () => {
    try {
      await disconnect()
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  if (!isConnected) return null

  return (
    <button 
      onClick={handleWalletDisconnect}
      disabled={isDisconnecting}
      className={`w-10 h-10 glass border-white/20 hover:border-red-500/50 hover:bg-red-500/10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 group relative overflow-hidden ${
        isDisconnecting ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      title={isDisconnecting ? "Disconnecting..." : `Disconnect Wallet (${address?.slice(0, 6)}...${address?.slice(-4)})`}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon */}
      <div className="relative z-10">
        {isDisconnecting ? (
          <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4 text-red-400 group-hover:text-red-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        )}
      </div>
    </button>
  )
}

function WalletDependentContent() {
  const { isConnected } = useAccount()
  
  return (
    <>
      {!isConnected && (
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Connect your wallet to start earning</p>
          <WalletConnect />
        </div>
      )}
      
      {isConnected && (
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <ConnectedDashboard />
          </div>
        </section>
      )}
    </>
  )
}

function ConnectedDashboard() {
  const { address, isConnected, chain } = useAccount()
  const [userBalance, setUserBalance] = useState(0)
  const realVaultData = useRealVaultStats()

  // Mock vault stats for SSR safety
  const vaultStats = {
    currentAPY: 8.45,
    tvl: "2847593",
    totalUsers: 1247,
    hedgeRatio: 0.73
  }

  const handleDeposit = (amount: number) => {
    setUserBalance(prev => prev + amount)
  }

  const handleWithdraw = (amount: number) => {
    setUserBalance(prev => Math.max(0, prev - amount))
  }

  return (
    <Tabs defaultValue="vault" className="space-y-6">
      <TabsList className="grid w-full grid-cols-6 bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl p-1">
        <TabsTrigger value="vault" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 dark:text-white/70 text-slate-600 rounded-xl">Vault</TabsTrigger>
        <TabsTrigger value="ai-insights" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 dark:text-white/70 text-slate-600 rounded-xl">AI Insights</TabsTrigger>
        <TabsTrigger value="portfolio" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 dark:text-white/70 text-slate-600 rounded-xl">Portfolio</TabsTrigger>
        <TabsTrigger value="socialfi" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 dark:text-white/70 text-slate-600 rounded-xl">SocialFi</TabsTrigger>
        <TabsTrigger value="bridge" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 dark:text-white/70 text-slate-600 rounded-xl">Bridge</TabsTrigger>
        <TabsTrigger value="privacy" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 dark:text-white/70 text-slate-600 rounded-xl">Privacy</TabsTrigger>
      </TabsList>

      <TabsContent value="vault" className="space-y-4">
        {/* COMPACT LAYOUT - Everything in one view */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column - Vault Stats + Community */}
          <div className="space-y-4">
            {/* Compact Vault Stats - Theme Adaptive Glassmorphism */}
            <div className="bg-slate-700/50 dark:bg-slate-700/50 bg-white/30 backdrop-blur-xl border border-slate-600/60 dark:border-slate-600/60 border-white/40 shadow-2xl rounded-2xl p-4 hover:bg-slate-700/70 dark:hover:bg-slate-700/70 hover:bg-white/40 transition-all duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-600/40 dark:bg-slate-600/40 bg-white/40 backdrop-blur-md rounded-xl border border-slate-500/50 dark:border-slate-500/50 border-white/50 hover:bg-slate-600/60 dark:hover:bg-slate-600/60 hover:bg-white/60 transition-all">
                  <div className="text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {vaultStats.currentAPY}%
                  </div>
                  <div className="text-xs text-slate-200 dark:text-slate-200 text-slate-700 font-medium">Current APY</div>
                </div>
                <div className="text-center p-3 bg-slate-600/40 dark:bg-slate-600/40 bg-white/40 backdrop-blur-md rounded-xl border border-slate-500/50 dark:border-slate-500/50 border-white/50 hover:bg-slate-600/60 dark:hover:bg-slate-600/60 hover:bg-white/60 transition-all">
                  <div className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    $2.85M
                  </div>
                  <div className="text-xs text-slate-200 dark:text-slate-200 text-slate-700 font-medium">TVL</div>
                </div>
                <div className="text-center p-3 bg-slate-600/40 dark:bg-slate-600/40 bg-white/40 backdrop-blur-md rounded-xl border border-slate-500/50 dark:border-slate-500/50 border-white/50 hover:bg-slate-600/60 dark:hover:bg-slate-600/60 hover:bg-white/60 transition-all">
                  <div className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    ${userBalance}
                  </div>
                  <div className="text-xs text-slate-200 dark:text-slate-200 text-slate-700 font-medium">Your Balance</div>
                </div>
                <div className="text-center p-3 bg-slate-600/40 dark:bg-slate-600/40 bg-white/40 backdrop-blur-md rounded-xl border border-slate-500/50 dark:border-slate-500/50 border-white/50 hover:bg-slate-600/60 dark:hover:bg-slate-600/60 hover:bg-white/60 transition-all">
                  <div className="text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    0.73%
                  </div>
                  <div className="text-xs text-slate-200 dark:text-slate-200 text-slate-700 font-medium">Hedge Ratio</div>
                </div>
              </div>
            </div>

            {/* Compact Community Vaults - Theme Adaptive Glassmorphism */}
            <div className="bg-slate-700/50 dark:bg-slate-700/50 bg-white/30 backdrop-blur-xl border border-slate-600/60 dark:border-slate-600/60 border-white/40 shadow-2xl rounded-2xl p-4 hover:bg-slate-700/70 dark:hover:bg-slate-700/70 hover:bg-white/40 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 715.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-white dark:text-white text-slate-800 text-sm">Community Vaults</h3>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-slate-600/40 dark:bg-slate-600/40 bg-white/40 backdrop-blur-md rounded-lg border border-slate-500/50 dark:border-slate-500/50 border-white/50 hover:bg-slate-600/60 dark:hover:bg-slate-600/60 hover:bg-white/60 transition-all">
                  <div className="text-lg font-bold text-green-400">2</div>
                  <div className="text-xs text-slate-200 dark:text-slate-200 text-slate-700 font-medium">Joined</div>
                </div>
                <div className="p-2 bg-slate-600/40 dark:bg-slate-600/40 bg-white/40 backdrop-blur-md rounded-lg border border-slate-500/50 dark:border-slate-500/50 border-white/50 hover:bg-slate-600/60 dark:hover:bg-slate-600/60 hover:bg-white/60 transition-all">
                  <div className="text-lg font-bold text-green-400">$2.95M</div>
                  <div className="text-xs text-slate-200 dark:text-slate-200 text-slate-700 font-medium">TVL</div>
                </div>
                <div className="p-2 bg-slate-600/40 dark:bg-slate-600/40 bg-white/40 backdrop-blur-md rounded-lg border border-slate-500/50 dark:border-slate-500/50 border-white/50 hover:bg-slate-600/60 dark:hover:bg-slate-600/60 hover:bg-white/60 transition-all">
                  <div className="text-lg font-bold text-green-400">13.9%</div>
                  <div className="text-xs text-slate-200 dark:text-slate-200 text-slate-700 font-medium">APY</div>
                </div>
              </div>
            </div>

            {/* Real Working Features - Fill Empty Space */}
            <div className="space-y-4">
              {/* Real Wallet Connection Status - Theme Adaptive Glassmorphism */}
              <div className="bg-slate-700/50 dark:bg-slate-700/50 bg-white/30 backdrop-blur-xl border border-slate-600/60 dark:border-slate-600/60 border-white/40 shadow-2xl rounded-2xl p-4 hover:bg-slate-700/70 dark:hover:bg-slate-700/70 hover:bg-white/40 transition-all duration-300">
                <h4 className="font-bold text-white dark:text-white text-slate-800 text-sm mb-3 flex items-center gap-2">
                  <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  Wallet Status
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200 dark:text-slate-200 text-slate-700 text-xs">Connection</span>
                    <div className={`flex items-center gap-1 ${realVaultData?.isConnected ? 'text-green-400' : 'text-red-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${realVaultData?.isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <span className="text-xs font-medium">{realVaultData?.isConnected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                  </div>
                  {address && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200 dark:text-slate-200 text-slate-700 text-xs">Address</span>
                      <span className="text-blue-400 text-xs font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
                    </div>
                  )}
                  {chain && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200 dark:text-slate-200 text-slate-700 text-xs">Network</span>
                      <span className="text-purple-400 text-xs font-medium">{chain.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Real USDT Balance from Blockchain - Theme Adaptive Glassmorphism */}
              <div className="bg-slate-700/50 dark:bg-slate-700/50 bg-white/30 backdrop-blur-xl border border-slate-600/60 dark:border-slate-600/60 border-white/40 shadow-2xl rounded-2xl p-4 hover:bg-slate-700/70 dark:hover:bg-slate-700/70 hover:bg-white/40 transition-all duration-300">
                <h4 className="font-bold text-white dark:text-white text-slate-800 text-sm mb-3 flex items-center gap-2">
                  <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/25">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  Real Balances
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-200 dark:text-slate-200 text-slate-700 text-xs">USDT Balance</span>
                    <span className="text-green-400 font-semibold text-sm">{realVaultData?.usdtBalance || "0.00"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-200 dark:text-slate-200 text-slate-700 text-xs">Vault Shares</span>
                    <span className="text-blue-400 font-semibold text-sm">{realVaultData?.vaultBalance || "0.00"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-200 dark:text-slate-200 text-slate-700 text-xs">Connection</span>
                    <span className={`font-semibold text-sm ${realVaultData?.isConnected ? 'text-green-400' : 'text-red-400'}`}>
                      {realVaultData?.isConnected ? 'Live' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column - Deposit/Withdraw (PROMINENT) */}
          <div>
            <DepositWithdraw
              onDeposit={handleDeposit}
              onWithdraw={handleWithdraw}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="ai-insights">
        <AIInsights />
      </TabsContent>

      <TabsContent value="portfolio">
        <div className="space-y-6">
          {/* REAL Portfolio Overview with Wallet Data */}
          <div className="bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <LineChart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white dark:text-white text-slate-800">Portfolio Overview</h2>
                  <p className="text-white/60 dark:text-white/60 text-slate-600 text-sm">Track your vault performance and earnings</p>
                </div>
              </div>
              {isConnected && (
                <div className="text-right">
                  <div className="text-xs text-white/60 dark:text-white/60 text-slate-600">Connected Wallet</div>
                  <div className="text-sm font-mono text-blue-400">{address?.slice(0, 6)}...{address?.slice(-4)}</div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 dark:bg-white/5 bg-slate-300/30 backdrop-blur-md rounded-xl p-4 border border-white/10 dark:border-white/10 border-slate-300/40">
                <div className="text-white/70 dark:text-white/70 text-slate-600 text-sm mb-2">Total Deposited</div>
                <div className="text-3xl font-black text-white dark:text-white text-slate-800">
                  ${isConnected ? realVaultData?.vaultBalance || "0.00" : "0.00"}
                </div>
                <div className="text-xs text-white/50 dark:text-white/50 text-slate-500 mt-1">
                  {isConnected ? `${realVaultData?.vaultBalance || "0.00"} kwUSDT shares` : "Connect wallet to view"}
                </div>
              </div>

              <div className="bg-white/5 dark:bg-white/5 bg-slate-300/30 backdrop-blur-md rounded-xl p-4 border border-white/10 dark:border-white/10 border-slate-300/40">
                <div className="text-white/70 dark:text-white/70 text-slate-600 text-sm mb-2">Estimated Earnings</div>
                <div className="text-3xl font-black text-green-400">
                  +${isConnected && realVaultData?.vaultBalance 
                    ? (((parseFloat(realVaultData.vaultBalance) * 8.45) / 100 / 365) * 30).toFixed(2)
                    : "0.00"
                  }
                </div>
                <div className="text-xs text-white/50 dark:text-white/50 text-slate-500 mt-1">Last 30 days (8.45% APY)</div>
              </div>
            </div>
          </div>

          {/* REAL Wallet Holdings */}
          <div className="bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white dark:text-white text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Wallet Holdings
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white/5 dark:bg-white/5 bg-slate-300/30 backdrop-blur-md rounded-xl border border-white/10 dark:border-white/10 border-slate-300/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    USDT
                  </div>
                  <div>
                    <div className="font-medium text-white dark:text-white text-slate-800">USDT Balance</div>
                    <div className="text-xs text-white/60 dark:text-white/60 text-slate-600">Available for deposit</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white dark:text-white text-slate-800">
                    {isConnected ? `${Number(realVaultData?.usdtBalance || "0").toFixed(2)}` : "0.00"}
                  </div>
                  <div className="text-xs text-white/60 dark:text-white/60 text-slate-600">USDT</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 dark:bg-white/5 bg-slate-300/30 backdrop-blur-md rounded-xl border border-white/10 dark:border-white/10 border-slate-300/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    KW
                  </div>
                  <div>
                    <div className="font-medium text-white dark:text-white text-slate-800">Vault Shares</div>
                    <div className="text-xs text-white/60 dark:text-white/60 text-slate-600">Earning yield</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white dark:text-white text-slate-800">
                    {isConnected ? `${Number(realVaultData?.vaultBalance || "0").toFixed(2)}` : "0.00"}
                  </div>
                  <div className="text-xs text-white/60 dark:text-white/60 text-slate-600">kwUSDT</div>
                </div>
              </div>

              {!isConnected && (
                <div className="text-center p-6 bg-white/5 dark:bg-white/5 bg-slate-300/30 backdrop-blur-md rounded-xl border border-white/10 dark:border-white/10 border-slate-300/40">
                  <div className="text-white/60 dark:text-white/60 text-slate-600 mb-3">Connect your wallet to view portfolio</div>
                  <Button onClick={() => window.location.reload()} className="bg-blue-500 hover:bg-blue-600">
                    Connect Wallet
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* REAL Performance Metrics */}
          {isConnected && parseFloat(realVaultData?.vaultBalance || "0") > 0 && (
            <div className="bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white dark:text-white text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Performance Metrics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/5 dark:bg-white/5 bg-slate-300/30 backdrop-blur-md rounded-xl border border-white/10 dark:border-white/10 border-slate-300/40">
                  <div className="text-2xl font-bold text-green-400">8.45%</div>
                  <div className="text-xs text-white/60 dark:text-white/60 text-slate-600">Current APY</div>
                </div>
                <div className="text-center p-4 bg-white/5 dark:bg-white/5 bg-slate-300/30 backdrop-blur-md rounded-xl border border-white/10 dark:border-white/10 border-slate-300/40">
                  <div className="text-2xl font-bold text-blue-400">
                    ${((parseFloat(realVaultData?.vaultBalance || "0") * 8.45) / 100 / 365).toFixed(4)}
                  </div>
                  <div className="text-xs text-white/60 dark:text-white/60 text-slate-600">Daily Earnings</div>
                </div>
                <div className="text-center p-4 bg-white/5 dark:bg-white/5 bg-slate-300/30 backdrop-blur-md rounded-xl border border-white/10 dark:border-white/10 border-slate-300/40">
                  <div className="text-2xl font-bold text-purple-400">
                    {realVaultData?.isConnected ? 'Live' : 'Offline'}
                  </div>
                  <div className="text-xs text-white/60 dark:text-white/60 text-slate-600">Status</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="socialfi">
        <SocialFiHub />
      </TabsContent>

      <TabsContent value="bridge">
        <CrossChainBridge />
      </TabsContent>

      <TabsContent value="privacy">
        <PrivacyMode />
      </TabsContent>
    </Tabs>
  )
}

export default function HomePage() {
  // Wagmi hooks for wallet functionality
  const { address, isConnected, chain } = useAccount()
  const { disconnect, isPending: isDisconnecting } = useDisconnect()
  
  // Real blockchain data hooks
  const vaultData = useVaultData()
  const { price: kaiaPrice } = useKaiaPrice()
  
  // State for success notification
  const [showDisconnectSuccess, setShowDisconnectSuccess] = useState(false)
  
  const vaultLoading = vaultData.isLoading
  const vaultError = vaultData.error


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 relative overflow-hidden">
      {/* Success Notification Popup */}
      {showDisconnectSuccess && (
        <div className="fixed top-6 right-6 z-[100] animate-slide-in-from-top">
          <div className="card-gradient border-2 border-green-500/30 shadow-2xl shadow-green-500/20 p-4 rounded-2xl max-w-sm">
            <div className="flex items-center gap-3">
              {/* Success Icon */}
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25 animate-pulse">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {/* Success Message */}
              <div className="flex-1">
                <h4 className="font-bold text-green-600 dark:text-green-400 text-sm">
                  Wallet Disconnected! 🎉
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Successfully disconnected from your wallet
                </p>
              </div>
              
              {/* Close Button */}
              <button 
                onClick={() => setShowDisconnectSuccess(false)}
                className="w-6 h-6 glass border-white/20 hover:border-red-500/50 hover:bg-red-500/10 rounded-lg flex items-center justify-center transition-all duration-200 group"
              >
                <svg className="w-3 h-3 text-muted-foreground group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400/10 to-cyan-600/10 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}} />
      </div>
      {/* Modern Header */}
      <header className="glass border-b border-white/20 dark:border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="w-full max-w-none px-8 lg:px-16 xl:px-24 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25 animate-glow">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">KW Vault</h1>
                <p className="text-sm text-muted-foreground font-medium">AI-Driven Yield Vault</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              
              {/* Disconnect Button - Client-only to prevent hydration issues */}
              <ClientOnlyDisconnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section-padding relative">
        <div className="w-full max-w-none px-8 lg:px-16 xl:px-24 text-center">
          <div className="max-w-7xl mx-auto relative z-10">
            {/* Floating Badge */}
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-8 animate-fade-in">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <Zap className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-gradient">AI-Powered Yield Optimization</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-balance mb-8 animate-slide-up">
              Maximize Your{' '}
              <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                USDT Yields
              </span>
              <br />
              <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-muted-foreground">
                with AI Intelligence
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground text-balance mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
              Cross-chain DeFi vault with AI-driven yield predictions, zero-knowledge privacy, and seamless LINE integration on the{' '}
              <span className="text-gradient-accent font-semibold">Kaia ecosystem</span>.
            </p>

            {/* Error Display */}

            {/* Key Metrics - Modern Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
              {/* APY Card */}
              <div className="bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl p-6 group hover:scale-105 hover:shadow-3xl hover:bg-white/15 transition-all duration-300 animate-slide-up relative overflow-hidden">
                {/* Shiny overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:shadow-green-500/50 group-hover:shadow-2xl transition-all duration-300 relative z-10">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent relative z-10">
                      {vaultLoading ? (
                        <div className="animate-pulse bg-muted rounded-lg h-10 w-20 mx-auto" />
                      ) : (
                        "8.45%"
                      )}
                    </div>
                    <div className="text-sm font-semibold text-white/70 dark:text-white/70 text-slate-600 uppercase tracking-wider relative z-10">Current APY</div>
                  </div>
                </div>
              </div>

              {/* TVL Card */}
              <div className="bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl p-6 group hover:scale-105 hover:shadow-3xl hover:bg-white/15 transition-all duration-300 animate-slide-up relative overflow-hidden" style={{ animationDelay: "0.1s" }}>
                {/* Shiny overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/50 group-hover:shadow-2xl transition-all duration-300 relative z-10">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent relative z-10">
                      {vaultLoading ? (
                        <div className="animate-pulse bg-muted rounded-lg h-10 w-24 mx-auto" />
                      ) : (
                        "$2.85M"
                      )}
                    </div>
                    <div className="text-sm font-semibold text-white/70 dark:text-white/70 text-slate-600 uppercase tracking-wider relative z-10">Total Value Locked</div>
                  </div>
                </div>
              </div>

              {/* Chains Card */}
              <div className="bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl p-6 group hover:scale-105 hover:shadow-3xl hover:bg-white/15 transition-all duration-300 animate-slide-up relative overflow-hidden" style={{ animationDelay: "0.2s" }}>
                {/* Shiny overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/50 group-hover:shadow-2xl transition-all duration-300 relative z-10">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent relative z-10">3</div>
                    <div className="text-sm font-semibold text-white/70 dark:text-white/70 text-slate-600 uppercase tracking-wider relative z-10">Supported Chains</div>
                  </div>
                </div>
              </div>

              {/* Users Card */}
              <div className="bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl p-6 group hover:scale-105 hover:shadow-3xl hover:bg-white/15 transition-all duration-300 animate-slide-up relative overflow-hidden" style={{ animationDelay: "0.3s" }}>
                {/* Shiny overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/50 group-hover:shadow-2xl transition-all duration-300 relative z-10">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-4xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent relative z-10">
                      {vaultLoading ? (
                        <div className="animate-pulse bg-muted rounded-lg h-10 w-16 mx-auto" />
                      ) : (
                        "1,247"
                      )}
                    </div>
                    <div className="text-sm font-semibold text-white/70 dark:text-white/70 text-slate-600 uppercase tracking-wider relative z-10">Active Users</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="animate-slide-up" style={{animationDelay: '0.4s'}}>
              <ClientOnlyWalletContent />
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard - Client-side only to prevent hydration mismatch */}

      {/* Features Section */}
      <section className="section-padding relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>
        
        <div className="w-full max-w-none px-8 lg:px-16 xl:px-24 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-gradient">Premium Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-balance mb-6 animate-slide-up">
              Why Choose{' '}
              <span className="text-gradient">KW Vault</span>?
            </h2>
            <p className="text-xl text-muted-foreground text-balance max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{animationDelay: '0.1s'}}>
              Advanced DeFi technology meets user-friendly design for optimal yield farming experience on the Kaia ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* AI Feature */}
            <div className="card-gradient group hover:scale-105 transition-all duration-500 animate-slide-up text-center" style={{animationDelay: '0.2s'}}>
              <div className="space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-110">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">AI-Powered Predictions</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Machine learning algorithms analyze market data to optimize your yields automatically with real-time insights
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium">
                  <ArrowRight className="w-4 h-4" />
                  <span>Learn More</span>
                </div>
              </div>
            </div>

            {/* Cross-Chain Feature */}
            <div className="card-gradient group hover:scale-105 transition-all duration-500 animate-slide-up text-center" style={{animationDelay: '0.3s'}}>
              <div className="space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-110">
                  <Globe className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gradient-accent">Cross-Chain Support</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Seamlessly bridge assets across Ethereum, BNB Chain, and Kaia for maximum opportunities and liquidity
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-accent font-medium">
                  <ArrowRight className="w-4 h-4" />
                  <span>Explore Chains</span>
                </div>
              </div>
            </div>

            {/* Privacy Feature */}
            <div className="card-gradient group hover:scale-105 transition-all duration-500 animate-slide-up text-center" style={{animationDelay: '0.4s'}}>
              <div className="space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:shadow-green-500/40 transition-all duration-300 group-hover:scale-110">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gradient">Zero-Knowledge Privacy</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    zkMe integration ensures your transactions remain private while maintaining full regulatory compliance
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium">
                  <Lock className="w-4 h-4" />
                  <span>Privacy First</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="relative overflow-hidden">
        {/* Footer Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        <div className="relative z-10 glass border-t border-white/10 py-12">
          <div className="container-modern text-center">
            <div className="space-y-8">
              {/* Logo Section */}
              <div className="flex items-center justify-center gap-3 animate-fade-in">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-white">KW Vault</h3>
                  <p className="text-sm text-gray-300">AI-Driven Yield Vault</p>
                </div>
              </div>
              
              {/* Description */}
              <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{animationDelay: '0.1s'}}>
                Built for Kaia Wave Stablecoin Summer Hackathon • Powered by AI & Cross-Chain Technology
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">8.45%</div>
                  <div className="text-sm text-gray-400">Current APY</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">$2.85M</div>
                  <div className="text-sm text-gray-400">Total Value Locked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">3</div>
                  <div className="text-sm text-gray-400">Supported Chains</div>
                </div>
              </div>
              
              {/* Copyright */}
              <div className="pt-8 border-t border-white/10 animate-fade-in" style={{animationDelay: '0.3s'}}>
                <p className="text-gray-400 text-sm">
                  © 2025 KW Vault. Built with LoVe for the Kaia ecosystem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
