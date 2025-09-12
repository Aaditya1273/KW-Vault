"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRightLeft, Shield, Clock, CheckCircle, AlertTriangle, Zap } from "lucide-react"

interface Chain {
  id: string
  name: string
  symbol: string
  logo: string
  gasToken: string
  bridgeFee: number
  estimatedTime: string
}

interface BridgeTransaction {
  id: string
  fromChain: string
  toChain: string
  amount: number
  status: "pending" | "processing" | "completed" | "failed"
  txHash?: string
  estimatedTime: number
  actualTime?: number
}

export function CrossChainBridge() {
  const [fromChain, setFromChain] = useState<string>("")
  const [toChain, setToChain] = useState<string>("")
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactions, setTransactions] = useState<BridgeTransaction[]>([])

  const chains: Chain[] = [
    {
      id: "kaia",
      name: "Kaia",
      symbol: "KAIA",
      logo: "/placeholder.svg?height=32&width=32&text=K",
      gasToken: "KAIA",
      bridgeFee: 0.1,
      estimatedTime: "2-5 min",
    },
    {
      id: "ethereum",
      name: "Ethereum",
      symbol: "ETH",
      logo: "/placeholder.svg?height=32&width=32&text=E",
      gasToken: "ETH",
      bridgeFee: 0.5,
      estimatedTime: "10-15 min",
    },
    {
      id: "bnb",
      name: "BNB Chain",
      symbol: "BNB",
      logo: "/placeholder.svg?height=32&width=32&text=B",
      gasToken: "BNB",
      bridgeFee: 0.2,
      estimatedTime: "3-7 min",
    },
  ]

  const [recentTransactions] = useState<BridgeTransaction[]>([
    {
      id: "1",
      fromChain: "ethereum",
      toChain: "kaia",
      amount: 1000,
      status: "completed",
      txHash: "0x1234...5678",
      estimatedTime: 15,
      actualTime: 12,
    },
    {
      id: "2",
      fromChain: "bnb",
      toChain: "kaia",
      amount: 500,
      status: "processing",
      estimatedTime: 7,
    },
  ])

  const getChainById = (id: string) => chains.find((c) => c.id === id)
  const fromChainData = getChainById(fromChain)
  const toChainData = getChainById(toChain)

  const calculateFees = () => {
    if (!fromChainData || !amount) return { bridgeFee: 0, gasFee: 0, total: 0 }

    const bridgeFee = fromChainData.bridgeFee
    const gasFee = fromChain === "ethereum" ? 15 : fromChain === "bnb" ? 3 : 1
    const total = bridgeFee + gasFee

    return { bridgeFee, gasFee, total }
  }

  const handleBridge = async () => {
    if (!fromChain || !toChain || !amount) return

    setIsProcessing(true)

    // Simulate bridge transaction
    const newTransaction: BridgeTransaction = {
      id: Date.now().toString(),
      fromChain,
      toChain,
      amount: Number.parseFloat(amount),
      status: "pending",
      estimatedTime: Number.parseInt(fromChainData?.estimatedTime.split("-")[1] || "5"),
    }

    setTransactions((prev) => [newTransaction, ...prev])

    // Simulate processing stages
    setTimeout(() => {
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.id === newTransaction.id
            ? { ...tx, status: "processing", txHash: "0x" + Math.random().toString(16).substr(2, 8) + "..." }
            : tx,
        ),
      )
    }, 2000)

    setTimeout(() => {
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.id === newTransaction.id
            ? { ...tx, status: "completed", actualTime: Math.floor(Math.random() * 5) + 8 }
            : tx,
        ),
      )
      setIsProcessing(false)
      setAmount("")
    }, 8000)
  }

  const getStatusIcon = (status: BridgeTransaction["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "processing":
        return <Zap className="w-4 h-4 text-blue-500 animate-pulse" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "failed":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
    }
  }

  const fees = calculateFees()

  return (
    <div className="space-y-6">
      {/* Bridge Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            Cross-Chain Bridge
          </CardTitle>
          <CardDescription>Bridge USDT across Ethereum, BNB Chain, and Kaia networks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chain Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Chain</Label>
              <Select value={fromChain} onValueChange={setFromChain}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source chain" />
                </SelectTrigger>
                <SelectContent>
                  {chains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id} disabled={chain.id === toChain}>
                      <div className="flex items-center gap-2">
                        <img src={chain.logo || "/placeholder.svg"} alt={chain.name} className="w-5 h-5" />
                        <span>{chain.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {chain.symbol}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>To Chain</Label>
              <Select value={toChain} onValueChange={setToChain}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination chain" />
                </SelectTrigger>
                <SelectContent>
                  {chains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id} disabled={chain.id === fromChain}>
                      <div className="flex items-center gap-2">
                        <img src={chain.logo || "/placeholder.svg"} alt={chain.name} className="w-5 h-5" />
                        <span>{chain.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {chain.symbol}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label>Amount (USDT)</Label>
            <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Available: 1,000 USDT</span>
              <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setAmount("1000")}>
                Max
              </Button>
            </div>
          </div>

          {/* Bridge Details */}
          {fromChain && toChain && amount && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <img src={fromChainData?.logo || "/placeholder.svg"} alt={fromChainData?.name} className="w-6 h-6" />
                  <span className="font-medium">{fromChainData?.name}</span>
                </div>
                <ArrowRightLeft className="w-5 h-5 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <img src={toChainData?.logo || "/placeholder.svg"} alt={toChainData?.name} className="w-6 h-6" />
                  <span className="font-medium">{toChainData?.name}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Bridge Amount:</span>
                  <span className="font-medium">{amount} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span>Bridge Fee:</span>
                  <span>${fees.bridgeFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gas Fee:</span>
                  <span>~${fees.gasFee}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total Cost:</span>
                  <span className="font-medium">${fees.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Time:</span>
                  <span>{fromChainData?.estimatedTime}</span>
                </div>
              </div>
            </div>
          )}

          {/* Bridge Button */}
          <Button
            className="w-full"
            onClick={handleBridge}
            disabled={!fromChain || !toChain || !amount || isProcessing}
          >
            {isProcessing ? "Processing Bridge..." : "Bridge Assets"}
          </Button>

          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Cross-chain bridges are secured by Allbridge Core protocol with multi-signature validation and time delays
              for large transfers.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Bridge History</CardTitle>
          <CardDescription>Track your cross-chain transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...transactions, ...recentTransactions].map((tx) => {
              const fromChainData = getChainById(tx.fromChain)
              const toChainData = getChainById(tx.toChain)

              return (
                <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(tx.status)}

                    <div className="flex items-center gap-2">
                      <img
                        src={fromChainData?.logo || "/placeholder.svg"}
                        alt={fromChainData?.name}
                        className="w-5 h-5"
                      />
                      <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                      <img src={toChainData?.logo || "/placeholder.svg"} alt={toChainData?.name} className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="font-medium">{tx.amount} USDT</div>
                      <div className="text-sm text-muted-foreground">
                        {fromChainData?.name} → {toChainData?.name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge
                      variant={
                        tx.status === "completed" ? "default" : tx.status === "failed" ? "destructive" : "secondary"
                      }
                    >
                      {tx.status}
                    </Badge>
                    {tx.txHash && <div className="text-xs text-muted-foreground mt-1 font-mono">{tx.txHash}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
