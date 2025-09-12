"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, Award, TrendingUp, DollarSign, Target, Crown } from "lucide-react"

interface LeaderboardEntry {
  rank: number
  address: string
  username: string
  avatar: string
  value: number
  change: number
  badge?: string
}

export function Leaderboard() {
  const [topEarners] = useState<LeaderboardEntry[]>([
    {
      rank: 1,
      address: "0x1234...5678",
      username: "YieldKing",
      avatar: "/king-avatar.jpg",
      value: 125000,
      change: 15.2,
      badge: "Whale",
    },
    {
      rank: 2,
      address: "0x2345...6789",
      username: "CryptoMaster",
      avatar: "/master-avatar.jpg",
      value: 98500,
      change: 12.8,
      badge: "Pro",
    },
    {
      rank: 3,
      address: "0x3456...7890",
      username: "DeFiGuru",
      avatar: "/guru-avatar.jpg",
      value: 87200,
      change: 8.5,
      badge: "Expert",
    },
    {
      rank: 4,
      address: "0x4567...8901",
      username: "YieldFarmer",
      avatar: "/farmer-avatar.png",
      value: 76800,
      change: -2.1,
    },
    {
      rank: 5,
      address: "0x5678...9012",
      username: "SmartTrader",
      avatar: "/trader-avatar.jpg",
      value: 65400,
      change: 5.7,
    },
  ])

  const [topDepositors] = useState<LeaderboardEntry[]>([
    {
      rank: 1,
      address: "0x1234...5678",
      username: "MegaWhale",
      avatar: "/mega-avatar.jpg",
      value: 5000000,
      change: 25.0,
      badge: "Legendary",
    },
    {
      rank: 2,
      address: "0x2345...6789",
      username: "BigInvestor",
      avatar: "/investor-avatar.png",
      value: 3200000,
      change: 18.5,
      badge: "Whale",
    },
    {
      rank: 3,
      address: "0x3456...7890",
      username: "VaultMaster",
      avatar: "/vault-avatar.jpg",
      value: 2800000,
      change: 12.3,
      badge: "Pro",
    },
  ])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">{rank}</span>
    }
  }

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case "Legendary":
        return "bg-purple-500"
      case "Whale":
        return "bg-blue-500"
      case "Pro":
        return "bg-green-500"
      case "Expert":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Leaderboard Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Community Leaderboard
          </CardTitle>
          <CardDescription>Compete with other users and climb the rankings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">#42</div>
              <div className="text-sm text-muted-foreground">Your Rank</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">1,250</div>
              <div className="text-sm text-muted-foreground">Your Score</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">+15</div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Tabs */}
      <Tabs defaultValue="earnings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="earnings" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Top Earners
          </TabsTrigger>
          <TabsTrigger value="deposits" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Top Depositors
          </TabsTrigger>
          <TabsTrigger value="missions" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Mission Masters
          </TabsTrigger>
        </TabsList>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle>Top Earners (30 Days)</CardTitle>
              <CardDescription>Users with highest yield earnings this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topEarners.map((entry) => (
                  <div
                    key={entry.rank}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8">{getRankIcon(entry.rank)}</div>

                      <Avatar className="w-10 h-10">
                        <AvatarImage src={entry.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{entry.username[0]}</AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{entry.username}</span>
                          {entry.badge && (
                            <Badge className={`text-xs ${getBadgeColor(entry.badge)}`}>{entry.badge}</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground font-mono">{entry.address}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-lg">${entry.value.toLocaleString()}</div>
                      <div
                        className={`text-sm flex items-center gap-1 ${
                          entry.change >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {entry.change >= 0 ? "↗" : "↘"}
                        {Math.abs(entry.change)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits">
          <Card>
            <CardHeader>
              <CardTitle>Top Depositors (All Time)</CardTitle>
              <CardDescription>Users with highest total deposits in KW Vault</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topDepositors.map((entry) => (
                  <div
                    key={entry.rank}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8">{getRankIcon(entry.rank)}</div>

                      <Avatar className="w-10 h-10">
                        <AvatarImage src={entry.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{entry.username[0]}</AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{entry.username}</span>
                          {entry.badge && (
                            <Badge className={`text-xs ${getBadgeColor(entry.badge)}`}>{entry.badge}</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground font-mono">{entry.address}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-lg">${(entry.value / 1000000).toFixed(1)}M</div>
                      <div
                        className={`text-sm flex items-center gap-1 ${
                          entry.change >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {entry.change >= 0 ? "↗" : "↘"}
                        {Math.abs(entry.change)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missions">
          <Card>
            <CardHeader>
              <CardTitle>Mission Masters</CardTitle>
              <CardDescription>Users with most completed missions and highest XP</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Mission leaderboard coming soon!</p>
                <p className="text-sm">Complete more missions to see your ranking here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
