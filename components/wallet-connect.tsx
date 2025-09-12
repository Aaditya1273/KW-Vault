"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut } from "lucide-react"

interface WalletConnectProps {
  isConnected: boolean
  onConnect: () => void
  onDisconnect: () => void
}

export function WalletConnect({ isConnected, onConnect, onDisconnect }: WalletConnectProps) {
  const [address] = useState("0x1234...5678")
  const [balance] = useState("1,234.56")

  if (!isConnected) {
    return (
      <Button onClick={onConnect} className="flex items-center gap-2">
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="hidden sm:inline">{address}</span>
          <span className="sm:hidden">Connected</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Wallet Address</span>
            <Badge variant="secondary" className="text-xs">
              Kaia
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-mono">{address}</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="p-3 border-b">
          <div className="text-sm text-muted-foreground">Balance</div>
          <div className="text-lg font-semibold">{balance} USDT</div>
        </div>

        <DropdownMenuItem className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          View on Explorer
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-2 text-destructive" onClick={onDisconnect}>
          <LogOut className="w-4 h-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
