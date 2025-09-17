"use client"

import { ConnectKaiaWallet } from '@/components/connect-kaia-wallet'

/**
 * WALLET CONNECT COMPONENT
 * Clean replacement for RainbowKit ConnectButton
 * Optimized for Kaia ecosystem
 */

export function WalletConnect() {
  return <ConnectKaiaWallet showNetworkSwitcher={false} />
}
