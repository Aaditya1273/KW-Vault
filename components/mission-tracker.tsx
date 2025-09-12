"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, CheckCircle, Clock, Zap, DollarSign, Users, TrendingUp, Gift } from "lucide-react"

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
  const [missions] = useState<Mission[]>([
    {
      id: "1",
      title: "First Deposit",
      description: "Make your first deposit to the KW Vault",
      type: "special",
      progress: 1,
      target: 1,
      reward: 100,
      xpReward: 50,
      completed: true,
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      id: "2",
      title: "Daily Yield Check",
      description: "Check your vault performance daily for 7 days",
      type: "daily",
      progress: 5,
      target: 7,
      reward: 50,
      xpReward: 25,
      completed: false,
      icon: <TrendingUp className="w-5 h-5" />,
      deadline: "23:59 today",
    },
    {
      id: "3",
      title: "Community Engagement",
      description: "Join 3 community vaults",
      type: "weekly",
      progress: 1,
      target: 3,
      reward: 200,
      xpReward: 100,
      completed: false,
      icon: <Users className="w-5 h-5" />,
      deadline: "6 days left",
    },
    {
      id: "4",
      title: "AI Optimization",
      description: "Apply AI recommendations 5 times",
      type: "weekly",
      progress: 2,
      target: 5,
      reward: 150,
      xpReward: 75,
      completed: false,
      icon: <Zap className="w-5 h-5" />,
      deadline: "6 days left",
    },
    {
      id: "5",
      title: "Yield Master",
      description: "Maintain 8%+ APY for 30 days",
      type: "special",
      progress: 12,
      target: 30,
      reward: 500,
      xpReward: 250,
      completed: false,
      icon: <Target className="w-5 h-5" />,
      deadline: "18 days left",
    },
  ])

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Mission Overview
          </CardTitle>
          <CardDescription>Complete missions to earn KW tokens and XP</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{activeMissions.length}</div>
              <div className="text-sm text-muted-foreground">Active Missions</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{completedMissions.length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {missions.reduce((sum, m) => sum + (m.completed ? m.reward : 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">KW Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Missions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Active Missions</h3>
        {activeMissions.map((mission) => (
          <Card key={mission.id} className="hover:shadow-md transition-shadow">
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
                  {mission.progress >= mission.target && (
                    <Button size="sm" className="mt-2">
                      <Gift className="w-4 h-4 mr-1" />
                      Claim
                    </Button>
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
            <Card key={mission.id} className="opacity-75">
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
    </div>
  )
}
