"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { TrendingUp, DollarSign, Target, Shield } from "lucide-react"

interface VaultStatsProps {
  apy: number
  tvl: number
  userBalance: number
  hedgeRatio: number
}

export function VaultStats({ apy, tvl, userBalance, hedgeRatio }: VaultStatsProps) {
  // Mock historical data
  const chartData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    apy: apy + Math.sin(i * 0.2) * 2 + Math.random() * 0.5,
    tvl: tvl + Math.sin(i * 0.1) * 100000 + Math.random() * 50000,
  }))

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current APY</p>
                <p className="text-2xl font-bold text-primary">{apy.toFixed(2)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <Badge variant="secondary" className="mt-2 text-xs">
              +0.3% vs yesterday
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">TVL</p>
                <p className="text-2xl font-bold">${(tvl / 1000000).toFixed(2)}M</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
            <Badge variant="secondary" className="mt-2 text-xs">
              +5.2% this week
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Balance</p>
                <p className="text-2xl font-bold">${userBalance.toLocaleString()}</p>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
            <Badge variant="secondary" className="mt-2 text-xs">
              {userBalance > 0 ? "Earning" : "Deposit to start"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hedge Ratio</p>
                <p className="text-2xl font-bold">{hedgeRatio}%</p>
              </div>
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div className="mt-2">
              <Progress value={hedgeRatio} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* APY Chart */}
      <Card>
        <CardHeader>
          <CardTitle>APY Performance (30 Days)</CardTitle>
          <CardDescription>Historical yield performance with AI optimization markers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-muted-foreground" tick={{ fontSize: 12 }} />
                <YAxis
                  className="text-muted-foreground"
                  tick={{ fontSize: 12 }}
                  domain={["dataMin - 1", "dataMax + 1"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Area
                  type="monotone"
                  dataKey="apy"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Allocation</CardTitle>
          <CardDescription>Current asset distribution across DeFi protocols</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-chart-1 rounded-full"></div>
                <span className="text-sm">Lending Protocols</span>
              </div>
              <div className="text-sm font-medium">45%</div>
            </div>
            <Progress value={45} className="h-2" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-chart-2 rounded-full"></div>
                <span className="text-sm">Liquidity Pools</span>
              </div>
              <div className="text-sm font-medium">30%</div>
            </div>
            <Progress value={30} className="h-2" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-chart-3 rounded-full"></div>
                <span className="text-sm">Yield Farming</span>
              </div>
              <div className="text-sm font-medium">25%</div>
            </div>
            <Progress value={25} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
