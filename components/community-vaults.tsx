"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Users, Crown } from "lucide-react"

interface CommunityVault {
  id: string
  name: string
  description: string
  creator: string
  creatorAvatar: string
  members: number
  maxMembers: number
  tvl: number
  apy: number
  minDeposit: number
  category: "conservative" | "balanced" | "aggressive"
  featured: boolean
  joined: boolean
}

export function CommunityVaults() {
  const [vaults] = useState<CommunityVault[]>([
    {
      id: "1",
      name: "Whale Watchers",
      description: "High-volume traders sharing alpha strategies",
      creator: "CryptoWhale",
      creatorAvatar: "/whale-avatar.png",
      members: 156,
      maxMembers: 200,
      tvl: 2500000,
      apy: 12.5,
      minDeposit: 10000,
      category: "aggressive",
      featured: true,
      joined: true,
    },
    {
      id: "2",
      name: "Steady Stackers",
      description: "Conservative yield farming for long-term growth",
      creator: "YieldMaster",
      creatorAvatar: "/master-avatar.jpg",
      members: 89,
      maxMembers: 100,
      tvl: 890000,
      apy: 8.2,
      minDeposit: 1000,
      category: "conservative",
      featured: false,
      joined: false,
    },
    {
      id: "3",
      name: "AI Optimizers",
      description: "Leveraging AI predictions for maximum yields",
      creator: "AITrader",
      creatorAvatar: "/ai-avatar.png",
      members: 234,
      maxMembers: 300,
      tvl: 1800000,
      apy: 10.8,
      minDeposit: 5000,
      category: "balanced",
      featured: true,
      joined: false,
    },
    {
      id: "4",
      name: "Cross-Chain Pioneers",
      description: "Exploring opportunities across multiple blockchains",
      creator: "ChainHopper",
      creatorAvatar: "/chain-avatar.jpg",
      members: 67,
      maxMembers: 150,
      tvl: 450000,
      apy: 15.3,
      minDeposit: 2500,
      category: "aggressive",
      featured: false,
      joined: true,
    },
  ])

  const getCategoryColor = (category: CommunityVault["category"]) => {
    switch (category) {
      case "conservative":
        return "bg-green-500"
      case "balanced":
        return "bg-blue-500"
      case "aggressive":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getCategoryLabel = (category: CommunityVault["category"]) => {
    switch (category) {
      case "conservative":
        return "Conservative"
      case "balanced":
        return "Balanced"
      case "aggressive":
        return "Aggressive"
      default:
        return "Unknown"
    }
  }

  const myVaults = vaults.filter((v) => v.joined)
  const availableVaults = vaults.filter((v) => !v.joined)

  return (
    <div className="space-y-6">
      {/* Community Overview */}
      <Card className="bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Community Vaults
          </CardTitle>
          <CardDescription>
            Join community-driven vaults to share strategies and maximize yields together
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl">
              <div className="text-2xl font-bold text-green-400">{myVaults.length}</div>
              <div className="text-sm text-white/60 dark:text-white/60 text-slate-600">Joined Vaults</div>
            </div>
            <div className="text-center p-4 bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl">
              <div className="text-2xl font-bold text-blue-400">
                ${myVaults.reduce((sum, v) => sum + v.tvl, 0).toLocaleString()}
              </div>
              <div className="text-sm text-white/60 dark:text-white/60 text-slate-600">Combined TVL</div>
            </div>
            <div className="text-center p-4 bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl">
              <div className="text-2xl font-bold text-yellow-400">
                {myVaults.length > 0 ? (myVaults.reduce((sum, v) => sum + v.apy, 0) / myVaults.length).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-white/60 dark:text-white/60 text-slate-600">Avg APY</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Vaults */}
      {myVaults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">My Community Vaults</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {myVaults.map((vault) => (
              <Card key={vault.id} className="bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {vault.featured && <Crown className="w-5 h-5 text-yellow-500" />}
                        <div>
                          <h4 className="font-semibold">{vault.name}</h4>
                          <p className="text-sm text-muted-foreground">{vault.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Joined</Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={vault.creatorAvatar || "/placeholder.svg"} />
                        <AvatarFallback>{vault.creator[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">by {vault.creator}</span>
                      <div className={`w-2 h-2 rounded-full ${getCategoryColor(vault.category)}`}></div>
                      <span className="text-xs text-muted-foreground">{getCategoryLabel(vault.category)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">APY</div>
                        <div className="font-semibold text-primary">{vault.apy}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">TVL</div>
                        <div className="font-semibold">${(vault.tvl / 1000000).toFixed(1)}M</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Members</span>
                        <span>
                          {vault.members} / {vault.maxMembers}
                        </span>
                      </div>
                      <Progress value={(vault.members / vault.maxMembers) * 100} className="h-2" />
                    </div>

                    <Button variant="outline" className="w-full bg-transparent">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Vaults */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Discover Community Vaults</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {availableVaults.map((vault) => (
            <Card key={vault.id} className="bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl hover:shadow-3xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {vault.featured && <Crown className="w-5 h-5 text-yellow-500" />}
                      <div>
                        <h4 className="font-semibold">{vault.name}</h4>
                        <p className="text-sm text-muted-foreground">{vault.description}</p>
                      </div>
                    </div>
                    {vault.featured && <Badge className="bg-yellow-500">Featured</Badge>}
                  </div>

                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={vault.creatorAvatar || "/placeholder.svg"} />
                      <AvatarFallback>{vault.creator[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">by {vault.creator}</span>
                    <div className={`w-2 h-2 rounded-full ${getCategoryColor(vault.category)}`}></div>
                    <span className="text-xs text-muted-foreground">{getCategoryLabel(vault.category)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">APY</div>
                      <div className="font-semibold text-primary">{vault.apy}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">TVL</div>
                      <div className="font-semibold">${(vault.tvl / 1000000).toFixed(1)}M</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Min Deposit</div>
                      <div className="font-semibold">${vault.minDeposit.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Members</span>
                      <span>
                        {vault.members} / {vault.maxMembers}
                      </span>
                    </div>
                    <Progress value={(vault.members / vault.maxMembers) * 100} className="h-2" />
                  </div>

                  <Button className="w-full">Join Vault</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
