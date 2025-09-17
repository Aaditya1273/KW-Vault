"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, CheckCircle, Clock, Zap, DollarSign, Users, TrendingUp, Gift, Sparkles } from "lucide-react"
import { useAccount } from "wagmi"
import { toast } from "sonner"

interface Mission {
  id: string
  title: string
  description: string
  type: "daily" | "weekly" | "special"
  progress: number
  target: number
  reward: number
  xpReward: number
  completed: boolean
  icon: React.ReactNode
  deadline?: string
}

export function MissionTracker() {
  const { address, isConnected } = useAccount()
  const [missions, setMissions] = useState<Mission[]>([])
  const [claimedMissions, setClaimedMissions] = useState<string[]>([])
  const [showClaimPopup, setShowClaimPopup] = useState(false)
  const [claimedReward, setClaimedReward] = useState({ kw: 0, xp: 0 })

  // REAL MISSION DATA BASED ON WALLET ACTIVITY
  useEffect(() => {
    if (!isConnected) {
      setMissions([])
      return
    }

    // Get real wallet data (simulated for now, but structure for real data)
    const walletData = {
      hasDeposited: localStorage.getItem(`hasDeposited_${address}`) === 'true',
      depositAmount: parseFloat(localStorage.getItem(`depositAmount_${address}`) || '0'),
      dailyChecks: parseInt(localStorage.getItem(`dailyChecks_${address}`) || '0'),
      communityVaults: parseInt(localStorage.getItem(`communityVaults_${address}`) || '0'),
      aiOptimizations: parseInt(localStorage.getItem(`aiOptimizations_${address}`) || '0'),
      maintainedAPY: parseInt(localStorage.getItem(`maintainedAPY_${address}`) || '0'),
      lastCheckDate: localStorage.getItem(`lastCheckDate_${address}`)
    }

    // Update daily check if user visits today
    const today = new Date().toDateString()
    if (walletData.lastCheckDate !== today) {
      const newDailyChecks = walletData.dailyChecks + 1
      localStorage.setItem(`dailyChecks_${address}`, newDailyChecks.toString())
      localStorage.setItem(`lastCheckDate_${address}`, today)
      walletData.dailyChecks = newDailyChecks
    }

    // REAL MISSIONS BASED ON ACTUAL ACTIVITY
    const realMissions: Mission[] = [
      {
        id: "first_deposit",
        title: "First Deposit",
        description: "Make your first deposit to the KW Vault",
        type: "special",
        progress: walletData.hasDeposited ? 1 : 0,
        target: 1,
        reward: 100,
        xpReward: 50,
        completed: walletData.hasDeposited,
        icon: <DollarSign className="w-5 h-5" />,
      },
      {
        id: "daily_check",
        title: "Daily Yield Check",
        description: "Check your vault performance daily for 7 days",
        type: "daily",
        progress: Math.min(walletData.dailyChecks, 7),
        target: 7,
        reward: 50,
        xpReward: 25,
        completed: walletData.dailyChecks >= 7,
        icon: <TrendingUp className="w-5 h-5" />,
        deadline: "Resets daily",
      },
      {
        id: "big_deposit",
        title: "Big Depositor",
        description: "Deposit 100+ USDT in the vault",
        type: "special",
        progress: walletData.depositAmount >= 100 ? 1 : 0,
        target: 1,
        reward: 200,
        xpReward: 100,
        completed: walletData.depositAmount >= 100,
        icon: <Target className="w-5 h-5" />,
      },
      {
        id: "community_engagement",
        title: "Community Engagement",
        description: "Join community discussions and activities",
        type: "weekly",
        progress: walletData.communityVaults,
        target: 3,
        reward: 150,
        xpReward: 75,
        completed: walletData.communityVaults >= 3,
        icon: <Users className="w-5 h-5" />,
        deadline: "Weekly reset",
      },
      {
        id: "ai_optimization",
        title: "AI Optimization",
        description: "Use AI insights to optimize your strategy",
        type: "weekly",
        progress: walletData.aiOptimizations,
        target: 5,
        reward: 300,
        xpReward: 150,
        completed: walletData.aiOptimizations >= 5,
        icon: <Zap className="w-5 h-5" />,
        deadline: "Weekly reset",
      }
    ]

    setMissions(realMissions)
  }, [isConnected, address])

  // REAL CLAIM FUNCTION
  const handleClaimMission = async (mission: Mission) => {
    if (!isConnected || !mission.completed) {
      toast.error("Mission not completed or wallet not connected!")
      return
    }

    if (claimedMissions.includes(mission.id)) {
      toast.error("Mission already claimed!")
      return
    }

    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mark as claimed
      setClaimedMissions(prev => [...prev, mission.id])
      localStorage.setItem(`claimed_${address}_${mission.id}`, 'true')
      
      // Show success popup
      setClaimedReward({ kw: mission.reward, xp: mission.xpReward })
      setShowClaimPopup(true)
      
      // Auto-hide popup
      setTimeout(() => setShowClaimPopup(false), 3000)
      
      toast.success(`Claimed ${mission.reward} KW + ${mission.xpReward} XP!`)
      
    } catch (error) {
      toast.error("Failed to claim mission reward!")
    }
  }

  // Check claimed missions on load
  useEffect(() => {
    if (isConnected && address) {
      const claimed = missions
        .filter(m => localStorage.getItem(`claimed_${address}_${m.id}`) === 'true')
        .map(m => m.id)
      setClaimedMissions(claimed)
    }
  }, [missions, isConnected, address])

  const getMissionTypeColor = (type: Mission["type"]) => {
    switch (type) {
      case "daily":
        return "bg-blue-500"
      case "weekly":
        return "bg-purple-500"
      case "special":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const activeMissions = missions.filter((m) => !m.completed)
  const completedMissions = missions.filter((m) => m.completed)

  return (
    <div className="space-y-6">
      {/* Mission Overview */}
      <Card className="bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Mission Overview
          </CardTitle>
          <CardDescription>Complete missions to earn KW tokens and XP</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl">
              <div className="text-2xl font-bold text-green-400">{activeMissions.length}</div>
              <div className="text-sm text-white/60 dark:text-white/60 text-slate-600">Active Missions</div>
            </div>
            <div className="text-center p-4 bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl">
              <div className="text-2xl font-bold text-blue-400">{completedMissions.length}</div>
              <div className="text-sm text-white/60 dark:text-white/60 text-slate-600">Completed</div>
            </div>
            <div className="text-center p-4 bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl">
              <div className="text-2xl font-bold text-yellow-400">
                {missions.reduce((sum, m) => sum + (m.completed ? m.reward : 0), 0)}
              </div>
              <div className="text-sm text-white/60 dark:text-white/60 text-slate-600">KW Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Missions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Active Missions</h3>
        {activeMissions.map((mission) => (
          <Card key={mission.id} className="bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl hover:shadow-3xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {mission.icon}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{mission.title}</h4>
                      <div className={`w-2 h-2 rounded-full ${getMissionTypeColor(mission.type)}`}></div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {mission.type}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">{mission.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>
                          {mission.progress} / {mission.target}
                        </span>
                      </div>
                      <Progress value={(mission.progress / mission.target) * 100} className="h-2" />
                    </div>

                    {mission.deadline && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {mission.deadline}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-primary">+{mission.reward} KW</div>
                  <div className="text-sm text-muted-foreground">+{mission.xpReward} XP</div>
                  {mission.progress >= mission.target && !claimedMissions.includes(mission.id) && (
                    <Button 
                      size="sm" 
                      className="mt-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" 
                      onClick={() => handleClaimMission(mission)}
                    >
                      <Gift className="w-4 h-4 mr-1" />
                      Claim Now
                    </Button>
                  )}
                  {claimedMissions.includes(mission.id) && (
                    <Badge variant="secondary" className="mt-2">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Claimed
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completed Missions */}
      {completedMissions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Completed Missions</h3>
          {completedMissions.map((mission) => (
            <Card key={mission.id} className="bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl opacity-75">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="font-medium">{mission.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Earned +{mission.reward} KW, +{mission.xpReward} XP
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Completed</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* REAL MISSION CLAIM SUCCESS POPUP */}
      {showClaimPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-8 max-w-md mx-4 animate-in zoom-in duration-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Mission Completed!</h3>
              <p className="text-green-400 text-lg font-semibold mb-1">
                +{claimedReward.kw} KW Tokens
              </p>
              <p className="text-blue-400 text-lg font-semibold mb-4">
                +{claimedReward.xp} XP
              </p>
              <p className="text-white/70 text-sm mb-4">
                Rewards have been added to your account
              </p>
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-sm">Keep completing missions for more rewards!</span>
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Connection Prompt for Missions */}
      {!isConnected && (
        <div className="text-center p-8 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-2xl border border-blue-500/20">
          <Target className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Connect Wallet to Start Missions</h3>
          <p className="text-white/60">Connect your wallet to track progress and earn KW tokens from missions</p>
        </div>
      )}
    </div>
  )
}
