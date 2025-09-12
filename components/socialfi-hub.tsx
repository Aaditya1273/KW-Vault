"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MissionTracker } from "@/components/mission-tracker"
import { CommunityVaults } from "@/components/community-vaults"
import { SpinWheel } from "@/components/spin-wheel"
import { Leaderboard } from "@/components/leaderboard"
import { Trophy, Users, Target, Gift, Crown, Star, TrendingUp, Coins } from "lucide-react"

export function SocialFiHub() {
  const [userStats] = useState({
    kwTokens: 1250,
    level: 5,
    xp: 2340,
    nextLevelXP: 3000,
    rank: 42,
    totalEarned: 5680,
    missionsCompleted: 18,
    communityVaults: 3,
  })

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-primary">
                <AvatarImage src="/diverse-user-avatars.png" />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">KW</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold">Yield Master</h3>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Level {userStats.level}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    Rank #{userStats.rank}
                  </span>
                  <span className="flex items-center gap-1">
                    <Coins className="w-4 h-4" />
                    {userStats.kwTokens.toLocaleString()} KW
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{userStats.kwTokens.toLocaleString()} KW</div>
              <div className="text-sm text-muted-foreground">Available to Claim</div>
              <Button className="mt-2">
                <Gift className="w-4 h-4 mr-2" />
                Claim All
              </Button>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level Progress</span>
              <span>
                {userStats.xp} / {userStats.nextLevelXP} XP
              </span>
            </div>
            <Progress value={(userStats.xp / userStats.nextLevelXP) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">${userStats.totalEarned.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Earned</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{userStats.missionsCompleted}</div>
            <div className="text-sm text-muted-foreground">Missions Done</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{userStats.communityVaults}</div>
            <div className="text-sm text-muted-foreground">Community Vaults</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{userStats.level}</div>
            <div className="text-sm text-muted-foreground">Current Level</div>
          </CardContent>
        </Card>
      </div>

      {/* SocialFi Tabs */}
      <Tabs defaultValue="missions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="missions" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Missions
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Community
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Spin & Win
          </TabsTrigger>
        </TabsList>

        <TabsContent value="missions">
          <MissionTracker />
        </TabsContent>

        <TabsContent value="community">
          <CommunityVaults />
        </TabsContent>

        <TabsContent value="leaderboard">
          <Leaderboard />
        </TabsContent>

        <TabsContent value="rewards">
          <SpinWheel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
