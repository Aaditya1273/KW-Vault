"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Gift, Zap, Star, Coins, Trophy, Sparkles, RotateCcw } from "lucide-react"

interface SpinReward {
  id: string
  label: string
  value: string
  probability: number
  color: string
  icon: React.ReactNode
}

export function SpinWheel() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [lastReward, setLastReward] = useState<SpinReward | null>(null)
  const [spinsLeft, setSpinsLeft] = useState(3)
  const [rotation, setRotation] = useState(0)

  const rewards: SpinReward[] = [
    {
      id: "1",
      label: "50 KW Tokens",
      value: "50 KW",
      probability: 30,
      color: "bg-blue-500",
      icon: <Coins className="w-4 h-4" />,
    },
    {
      id: "2",
      label: "100 KW Tokens",
      value: "100 KW",
      probability: 20,
      color: "bg-green-500",
      icon: <Coins className="w-4 h-4" />,
    },
    {
      id: "3",
      label: "25 XP Bonus",
      value: "25 XP",
      probability: 25,
      color: "bg-purple-500",
      icon: <Star className="w-4 h-4" />,
    },
    {
      id: "4",
      label: "200 KW Tokens",
      value: "200 KW",
      probability: 10,
      color: "bg-orange-500",
      icon: <Coins className="w-4 h-4" />,
    },
    {
      id: "5",
      label: "Rare NFT Badge",
      value: "NFT Badge",
      probability: 5,
      color: "bg-pink-500",
      icon: <Trophy className="w-4 h-4" />,
    },
    {
      id: "6",
      label: "500 KW Jackpot",
      value: "500 KW",
      probability: 2,
      color: "bg-yellow-500",
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: "7",
      label: "75 XP Bonus",
      value: "75 XP",
      probability: 8,
      color: "bg-indigo-500",
      icon: <Star className="w-4 h-4" />,
    },
  ]

  const spinWheel = async () => {
    if (spinsLeft <= 0 || isSpinning) return

    setIsSpinning(true)

    // Calculate random reward based on probabilities
    const random = Math.random() * 100
    let cumulative = 0
    let selectedReward = rewards[0]

    for (const reward of rewards) {
      cumulative += reward.probability
      if (random <= cumulative) {
        selectedReward = reward
        break
      }
    }

    // Calculate rotation (multiple full spins + final position)
    const spins = 5 + Math.random() * 5 // 5-10 full rotations
    const finalAngle = (rewards.indexOf(selectedReward) / rewards.length) * 360
    const totalRotation = rotation + spins * 360 + finalAngle

    setRotation(totalRotation)

    // Wait for animation to complete
    setTimeout(() => {
      setLastReward(selectedReward)
      setSpinsLeft((prev) => prev - 1)
      setIsSpinning(false)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      {/* Spin Wheel Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Spin & Win Rewards
          </CardTitle>
          <CardDescription>Spin the wheel when withdrawing to win bonus KW tokens and prizes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{spinsLeft}</div>
              <div className="text-sm text-muted-foreground">Spins Left</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">1,250</div>
              <div className="text-sm text-muted-foreground">Total Won</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">15</div>
              <div className="text-sm text-muted-foreground">Total Spins</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spin Wheel */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Wheel Container */}
            <div className="relative">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-primary"></div>
              </div>

              {/* Wheel */}
              <div
                className="w-80 h-80 rounded-full border-4 border-primary relative overflow-hidden transition-transform duration-3000 ease-out"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  background: `conic-gradient(${rewards
                    .map((reward, index) => {
                      const startAngle = (index / rewards.length) * 360
                      const endAngle = ((index + 1) / rewards.length) * 360
                      return `${reward.color} ${startAngle}deg ${endAngle}deg`
                    })
                    .join(", ")})`,
                }}
              >
                {/* Reward Segments */}
                {rewards.map((reward, index) => {
                  const angle = (360 / rewards.length) * index
                  const midAngle = angle + 360 / rewards.length / 2

                  return (
                    <div
                      key={reward.id}
                      className="absolute w-full h-full flex items-center justify-center text-white font-bold text-sm"
                      style={{
                        transform: `rotate(${midAngle}deg)`,
                        transformOrigin: "center",
                      }}
                    >
                      <div
                        className="flex flex-col items-center gap-1"
                        style={{ transform: `rotate(-${midAngle}deg)` }}
                      >
                        {reward.icon}
                        <span className="text-xs text-center leading-tight">{reward.value}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Spin Button */}
            <Button size="lg" onClick={spinWheel} disabled={spinsLeft <= 0 || isSpinning} className="min-w-32">
              {isSpinning ? (
                <>
                  <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                  Spinning...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Spin Wheel
                </>
              )}
            </Button>

            {spinsLeft <= 0 && (
              <Alert>
                <Gift className="h-4 w-4" />
                <AlertDescription>You've used all your spins! Make a withdrawal to earn more spins.</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Last Reward */}
      {lastReward && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">🎉 Congratulations!</div>
              <div className="flex items-center justify-center gap-2 mb-2">
                {lastReward.icon}
                <span className="text-xl font-bold text-primary">You won {lastReward.value}!</span>
              </div>
              <p className="text-sm text-muted-foreground">{lastReward.label}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reward Probabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Reward Probabilities</CardTitle>
          <CardDescription>See your chances of winning each reward</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rewards.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${reward.color}`}></div>
                  <div className="flex items-center gap-2">
                    {reward.icon}
                    <span className="font-medium">{reward.label}</span>
                  </div>
                </div>
                <Badge variant="outline">{reward.probability}%</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
