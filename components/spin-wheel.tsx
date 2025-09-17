"use client"

import React, { useState, useRef, useEffect } from "react"
import { Sparkles, Zap, Gift, Coins, Star, Trophy, RotateCcw } from "lucide-react"
import { useAccount } from "wagmi"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Reward {
  id: number
  label: string
  color: string
  icon: React.ComponentType<any>
  probability: number
}

export function SpinWheel() {
  const { address, isConnected } = useAccount()
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [spinsLeft, setSpinsLeft] = useState(0)
  const [totalWon, setTotalWon] = useState(0)
  const [totalSpins, setTotalSpins] = useState(0)
  const wheelRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)

  // REAL DATA - Load user's spin data from localStorage
  useEffect(() => {
    if (isConnected && address) {
      const savedSpinsLeft = parseInt(localStorage.getItem(`spinsLeft_${address}`) || '3')
      const savedTotalWon = parseInt(localStorage.getItem(`totalWon_${address}`) || '0')
      const savedTotalSpins = parseInt(localStorage.getItem(`totalSpins_${address}`) || '0')
      
      setSpinsLeft(savedSpinsLeft)
      setTotalWon(savedTotalWon)
      setTotalSpins(savedTotalSpins)
    }
  }, [isConnected, address])

  const rewards = [
    { id: 1, label: "50 KW", color: "#3B82F6", icon: Coins, probability: 30 },
    { id: 2, label: "25 XP", color: "#8B5CF6", icon: Star, probability: 25 },
    { id: 3, label: "100 KW", color: "#10B981", icon: Coins, probability: 20 },
    { id: 4, label: "75 XP", color: "#6366F1", icon: Star, probability: 15 },
    { id: 5, label: "200 KW", color: "#F97316", icon: Coins, probability: 8 },
    { id: 6, label: "NFT Badge", color: "#EC4899", icon: Trophy, probability: 1.8 },
    { id: 7, label: "500 KW", color: "#EAB308", icon: Sparkles, probability: 0.2 }
  ]

  const segmentAngle = 360 / rewards.length

  // Calculate which reward was selected based on final rotation
  const getSelectedReward = (finalRotation: number) => {
    const normalizedRotation = (360 - (finalRotation % 360)) % 360
    const segmentIndex = Math.floor(normalizedRotation / segmentAngle)
    return rewards[segmentIndex] || rewards[0]
  }

  // Weighted random selection
  const selectRandomReward = () => {
    const random = Math.random() * 100
    let cumulative = 0
    
    for (const reward of rewards) {
      cumulative += reward.probability
      if (random <= cumulative) {
        return reward
      }
    }
    return rewards[0]
  }

  // Smooth easing function
  const easeOut = (t: number) => {
    return 1 - Math.pow(1 - t, 4)
  }

  const spinWheel = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first!")
      return
    }

    if (spinsLeft <= 0 || isSpinning) {
      toast.error("No spins left! Complete missions to earn more spins.")
      return
    }

    setIsSpinning(true)
    setShowResult(false)
    setSelectedReward(null)

    // Select reward first
    const targetReward = selectRandomReward()
    const targetIndex = rewards.findIndex(r => r.id === targetReward.id)
    
    // Calculate target angle to land on selected reward
    const targetSegmentCenter = targetIndex * segmentAngle + segmentAngle / 2
    const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.8) // Random position within segment
    const targetAngle = targetSegmentCenter + randomOffset
    
    // Add multiple full rotations for dramatic effect
    const fullRotations = 5 + Math.random() * 3 // 5-8 full spins
    const finalRotation = rotation + (fullRotations * 360) + (360 - targetAngle)

    // Animate with smooth easing
    const startTime = Date.now()
    const duration = 4000 + Math.random() * 2000 // 4-6 seconds
    const startRotation = rotation

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      const easedProgress = easeOut(progress)
      const currentRotation = startRotation + (finalRotation - startRotation) * easedProgress
      
      setRotation(currentRotation)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // REAL REWARD PROCESSING
        const rewardValue = parseInt(targetReward.label.replace(/\D/g, '')) || 0
        const newTotalWon = totalWon + rewardValue
        const newTotalSpins = totalSpins + 1
        const newSpinsLeft = spinsLeft - 1

        // Save REAL data to localStorage
        if (address) {
          localStorage.setItem(`spinsLeft_${address}`, newSpinsLeft.toString())
          localStorage.setItem(`totalWon_${address}`, newTotalWon.toString())
          localStorage.setItem(`totalSpins_${address}`, newTotalSpins.toString())
        }

        // Update state
        setSpinsLeft(newSpinsLeft)
        setTotalWon(newTotalWon)
        setTotalSpins(newTotalSpins)
        setIsSpinning(false)
        setSelectedReward(targetReward)
        setShowResult(true)
        
        // Hide result after 5 seconds
        setTimeout(() => {
          setShowResult(false)
        }, 5000)

        toast.success(`🎉 Won ${targetReward.label}! Added to your account.`)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8 relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Header Section */}
      <div className="text-center space-y-4 relative z-10">
        <div className="inline-flex items-center gap-2 glass-card px-4 py-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm font-semibold text-gradient">Gamified Rewards</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gradient mb-2">Spin & Win</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Spin the wheel when withdrawing to win bonus KW tokens, XP, and exclusive NFT badges</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
        <div className="card-gradient group hover:scale-105 transition-all duration-300">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300">
              <RotateCcw className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-gradient">{spinsLeft}</div>
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Spins Left</div>
            </div>
          </div>
        </div>
        
        <div className="card-gradient group hover:scale-105 transition-all duration-300">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:shadow-green-500/40 transition-all duration-300">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-gradient-accent">{totalWon.toLocaleString()}</div>
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Won</div>
            </div>
          </div>
        </div>
        
        <div className="card-gradient group hover:scale-105 transition-all duration-300">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-300">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">{totalSpins}</div>
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Spins</div>
            </div>
          </div>
        </div>
      </div>

      {/* Spin Wheel */}
      <div className="card-gradient relative overflow-hidden animate-slide-up" style={{animationDelay: '0.2s'}}>
        <div className="p-8">
          <div className="flex flex-col items-center space-y-8">
            {/* Wheel Container */}
            <div className="relative">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3 z-20">
                <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-white shadow-lg animate-bounce" style={{animationDuration: '2s'}}></div>
              </div>

              {/* Wheel Glow Effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-600/20 blur-xl animate-pulse" />
              
              {/* Wheel */}
              <div
                className="w-96 h-96 rounded-full border-8 border-white/20 relative overflow-hidden transition-transform duration-3000 ease-out shadow-2xl"
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
                {/* Inner Circle */}
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20" />
                
                {/* Center Hub */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full shadow-lg flex items-center justify-center border-4 border-white/30">
                  <Sparkles className="w-6 h-6 text-white animate-pulse" />
                </div>

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
                        className="flex flex-col items-center gap-2 mt-8"
                        style={{ transform: `rotate(-${midAngle}deg)` }}
                      >
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                          <reward.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs text-center leading-tight font-bold drop-shadow-lg">{reward.label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Spin Button */}
            <Button 
              size="lg" 
              onClick={spinWheel} 
              disabled={spinsLeft <= 0 || isSpinning} 
              className="min-w-40 h-16 text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105"
            >
              {isSpinning ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Spinning...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5" />
                  Spin Wheel
                </div>
              )}
            </Button>

            {spinsLeft <= 0 && (
              <div className="glass-card p-4 border border-orange-500/20 max-w-md">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Gift className="w-4 h-4 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-orange-600 dark:text-orange-400">No Spins Left</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      You've used all your spins! Make a withdrawal to earn more spins.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result Popup */}
      {showResult && selectedReward && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-yellow-500/20 to-purple-600/20 backdrop-blur-xl border border-yellow-400/30 rounded-3xl p-8 max-w-md mx-4 animate-bounce">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-2xl">
                <selectedReward.icon className="w-12 h-12 text-white" />
              </div>
              
              <h3 className="text-4xl font-bold text-white mb-4">🎉 WINNER! 🎉</h3>
              
              <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-4">
                <p className="text-yellow-400 text-3xl font-bold mb-2">
                  {selectedReward.label}
                </p>
                <p className="text-white/70 text-lg">
                  Congratulations on your win!
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span className="text-sm font-medium">Added to your account!</span>
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Probability Display */}
      <div className="mt-8 bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 max-w-2xl z-10">
        <h3 className="text-white font-bold text-lg mb-4 text-center">Win Probabilities</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {rewards.map((reward) => {
            return (
              <div key={reward.id} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: reward.color }}
                ></div>
                <reward.icon className="w-4 h-4 text-white/70" />
                <span className="text-white/90 text-sm font-medium">{reward.label}</span>
                <span className="text-yellow-400 text-xs font-bold ml-auto">{reward.probability}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Wallet Connection Prompt */}
      {!isConnected && (
        <div className="text-center p-8 bg-gradient-to-br from-yellow-500/10 to-orange-600/10 rounded-2xl border border-yellow-500/20">
          <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Connect Wallet to Spin</h3>
          <p className="text-white/60">Connect your wallet to start spinning and winning rewards</p>
        </div>
      )}
    </div>
  )
}
