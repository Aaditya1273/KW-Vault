"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { VaultStats } from "@/components/vault-stats"
import { AIInsights } from "@/components/ai-insights"
import { DepositWithdraw } from "@/components/deposit-withdraw"
import { WalletConnect } from "@/components/wallet-connect"
import { ThemeToggle } from "@/components/theme-toggle"
import { TrendingUp, Shield, Zap, Globe, Brain, LineChart } from "lucide-react"
import { SocialFiHub } from "@/components/socialfi-hub"
import { CrossChainBridge } from "@/components/cross-chain-bridge"
import { PrivacyMode } from "@/components/privacy-mode"

export default function HomePage() {
  const [isConnected, setIsConnected] = useState(false)
  const [currentAPY, setCurrentAPY] = useState(8.45)
  const [tvl, setTVL] = useState(2450000)
  const [userBalance, setUserBalance] = useState(0)

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setCurrentAPY((prev) => prev + (Math.random() - 0.5) * 0.1)
      setTVL((prev) => prev + (Math.random() - 0.5) * 10000)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">KW Vault</h1>
                <p className="text-sm text-muted-foreground">AI-Driven Yield Vault</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <WalletConnect
                isConnected={isConnected}
                onConnect={() => setIsConnected(true)}
                onDisconnect={() => setIsConnected(false)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-4 animate-pulse-glow">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Yield Optimization
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-balance mb-6">
              Maximize Your <span className="text-primary">USDT Yields</span> with AI Intelligence
            </h2>
            <p className="text-xl text-muted-foreground text-balance mb-8">
              Cross-chain DeFi vault with AI-driven yield predictions, zero-knowledge privacy, and seamless LINE
              integration on Kaia ecosystem.
            </p>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="animate-slide-up">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">{currentAPY.toFixed(2)}%</div>
                  <div className="text-sm text-muted-foreground">Current APY</div>
                </CardContent>
              </Card>

              <Card className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <CardContent className="p-6 text-center">
                  <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">${(tvl / 1000000).toFixed(2)}M</div>
                  <div className="text-sm text-muted-foreground">Total Value Locked</div>
                </CardContent>
              </Card>

              <Card className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <CardContent className="p-6 text-center">
                  <Globe className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">3</div>
                  <div className="text-sm text-muted-foreground">Supported Chains</div>
                </CardContent>
              </Card>
            </div>

            {!isConnected && (
              <Button size="lg" className="animate-pulse-glow" onClick={() => setIsConnected(true)}>
                Connect Wallet to Start Earning
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      {isConnected && (
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <Tabs defaultValue="vault" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="vault">Vault</TabsTrigger>
                <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="socialfi">SocialFi</TabsTrigger>
                <TabsTrigger value="bridge">Bridge</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
              </TabsList>

              <TabsContent value="vault" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Vault Stats */}
                  <div className="lg:col-span-2">
                    <VaultStats apy={currentAPY} tvl={tvl} userBalance={userBalance} hedgeRatio={45} />
                  </div>

                  {/* Deposit/Withdraw */}
                  <div>
                    <DepositWithdraw
                      onDeposit={(amount) => setUserBalance((prev) => prev + amount)}
                      onWithdraw={(amount) => setUserBalance((prev) => Math.max(0, prev - amount))}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ai-insights">
                <AIInsights />
              </TabsContent>

              <TabsContent value="portfolio">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="w-5 h-5" />
                      Portfolio Overview
                    </CardTitle>
                    <CardDescription>Track your vault performance and earnings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Total Deposited</div>
                          <div className="text-2xl font-bold">${userBalance.toLocaleString()}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Estimated Earnings</div>
                          <div className="text-2xl font-bold text-primary">
                            +${(((userBalance * currentAPY) / 100 / 365) * 30).toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">Last 30 days</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Vault Performance</span>
                          <span className="text-primary">+{currentAPY.toFixed(2)}% APY</span>
                        </div>
                        <Progress value={Math.min(100, (currentAPY / 15) * 100)} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Why Choose KW Vault?</h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Advanced DeFi technology meets user-friendly design for optimal yield farming experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">AI-Powered Predictions</h4>
                <p className="text-muted-foreground">
                  Machine learning algorithms analyze market data to optimize your yields automatically
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Cross-Chain Support</h4>
                <p className="text-muted-foreground">
                  Seamlessly bridge assets across Ethereum, BNB Chain, and Kaia for maximum opportunities
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Zero-Knowledge Privacy</h4>
                <p className="text-muted-foreground">
                  zkMe integration ensures your transactions remain private while maintaining compliance
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-6 h-6 text-primary" />
            <span className="font-semibold">KW Vault</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Built for Kaia Wave Stablecoin Summer Hackathon • Powered by AI & Cross-Chain Technology
          </p>
        </div>
      </footer>
    </div>
  )
}
