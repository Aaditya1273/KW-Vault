"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDownToLine, ArrowUpFromLine, Clock, Shield, Globe, Lock, Zap } from "lucide-react"

interface DepositWithdrawProps {
  onDeposit: (amount: number) => void
  onWithdraw: (amount: number) => void
}

export function DepositWithdraw({ onDeposit, onWithdraw }: DepositWithdrawProps) {
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [usePrivateMode, setUsePrivateMode] = useState(false)
  const [selectedChain, setSelectedChain] = useState("kaia")
  const [useCrossChain, setUseCrossChain] = useState(false)

  const chains = [
    { id: "kaia", name: "Kaia", symbol: "KAIA", fee: 0.1 },
    { id: "ethereum", name: "Ethereum", symbol: "ETH", fee: 15 },
    { id: "bnb", name: "BNB Chain", symbol: "BNB", fee: 3 },
  ]

  const handleDeposit = async () => {
    if (!depositAmount || Number.parseFloat(depositAmount) <= 0) return

    setIsProcessing(true)
    // Simulate transaction with cross-chain and privacy features
    await new Promise((resolve) => setTimeout(resolve, usePrivateMode ? 3000 : 2000))

    onDeposit(Number.parseFloat(depositAmount))
    setDepositAmount("")
    setIsProcessing(false)
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || Number.parseFloat(withdrawAmount) <= 0) return

    setIsProcessing(true)
    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))

    onWithdraw(Number.parseFloat(withdrawAmount))
    setWithdrawAmount("")
    setIsProcessing(false)
  }

  const getChainFee = () => {
    const chain = chains.find((c) => c.id === selectedChain)
    return chain?.fee || 0
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vault Operations</CardTitle>
        <CardDescription>
          Deposit USDT to earn yield or withdraw your funds with cross-chain and privacy options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="deposit" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit" className="flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex items-center gap-2">
              <ArrowUpFromLine className="w-4 h-4" />
              Withdraw
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="space-y-4">
            {/* Cross-Chain Option */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">Cross-Chain Deposit</span>
              </div>
              <Switch checked={useCrossChain} onCheckedChange={setUseCrossChain} />
            </div>

            {useCrossChain && (
              <div className="space-y-2">
                <Label>Source Chain</Label>
                <Select value={selectedChain} onValueChange={setSelectedChain}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {chains.map((chain) => (
                      <SelectItem key={chain.id} value={chain.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{chain.name}</span>
                          <Badge variant="outline" className="ml-2">
                            ${chain.fee} fee
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Privacy Mode */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">Private Transaction</span>
                <Badge variant="outline" className="text-xs">
                  zkMe Required
                </Badge>
              </div>
              <Switch checked={usePrivateMode} onCheckedChange={setUsePrivateMode} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit-amount">Amount (USDT)</Label>
              <Input
                id="deposit-amount"
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Balance: 1,000 USDT</span>
                <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setDepositAmount("1000")}>
                  Max
                </Button>
              </div>
            </div>

            {depositAmount && Number.parseFloat(depositAmount) > 0 && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>You will receive:</span>
                  <span className="font-medium">~{Number.parseFloat(depositAmount).toFixed(2)} kwUSDT shares</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Estimated APY:</span>
                  <span className="font-medium text-primary">8.45%</span>
                </div>
                {useCrossChain && (
                  <div className="flex justify-between text-sm">
                    <span>Bridge Fee:</span>
                    <span className="font-medium">${getChainFee()}</span>
                  </div>
                )}
                {usePrivateMode && (
                  <div className="flex justify-between text-sm">
                    <span>Privacy Fee:</span>
                    <span className="font-medium">$2.00</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>KW Token Reward:</span>
                  <span className="font-medium text-secondary">
                    +{(Number.parseFloat(depositAmount) * 0.01).toFixed(2)} KW
                  </span>
                </div>
              </div>
            )}

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                {usePrivateMode
                  ? "Private deposits use zero-knowledge proofs to hide transaction details while maintaining security."
                  : "Your deposit is protected by smart contract security audits and insurance coverage."}
              </AlertDescription>
            </Alert>

            <Button
              className="w-full"
              onClick={handleDeposit}
              disabled={!depositAmount || Number.parseFloat(depositAmount) <= 0 || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  {usePrivateMode ? "Processing Private Deposit..." : "Processing Deposit..."}
                </>
              ) : (
                <>
                  {usePrivateMode && <Lock className="w-4 h-4 mr-2" />}
                  {useCrossChain && <Globe className="w-4 h-4 mr-2" />}
                  Deposit USDT
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-4">
            {/* Privacy Mode for Withdrawal */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">Private Withdrawal</span>
                <Badge variant="outline" className="text-xs">
                  zkMe Required
                </Badge>
              </div>
              <Switch checked={usePrivateMode} onCheckedChange={setUsePrivateMode} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Amount (USDT)</Label>
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Available: 500 USDT</span>
                <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setWithdrawAmount("500")}>
                  Max
                </Button>
              </div>
            </div>

            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                {usePrivateMode
                  ? "Private withdrawals have a 2-hour cooldown period and include a free spin on the reward wheel."
                  : "Withdrawals have a 1-hour cooldown period for security. Emergency withdrawals available with 5% fee."}
              </AlertDescription>
            </Alert>

            {withdrawAmount && Number.parseFloat(withdrawAmount) > 0 && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>You will receive:</span>
                  <span className="font-medium">{Number.parseFloat(withdrawAmount).toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shares to burn:</span>
                  <span className="font-medium">~{Number.parseFloat(withdrawAmount).toFixed(2)} kwUSDT</span>
                </div>
                {usePrivateMode && (
                  <div className="flex justify-between text-sm">
                    <span>Privacy Fee:</span>
                    <span className="font-medium">$1.50</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-primary">
                  <span>Bonus Reward:</span>
                  <span className="font-medium">Free Spin Wheel!</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={handleWithdraw}
                disabled={!withdrawAmount || Number.parseFloat(withdrawAmount) <= 0 || isProcessing}
              >
                {isProcessing ? "Processing..." : "Normal Withdraw"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleWithdraw}
                disabled={!withdrawAmount || Number.parseFloat(withdrawAmount) <= 0 || isProcessing}
              >
                Emergency Withdraw
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
