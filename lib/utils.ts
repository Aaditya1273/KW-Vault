import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 🎯 WALLET UTILITIES
 * Helper functions for wallet operations
 */

// Format wallet address for display (0x1234...5678)
export function formatAddress(address: string, chars = 4): string {
  if (!address) return ''
  if (address.length <= chars * 2 + 2) return address
  
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

// Validate Ethereum address format
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// Convert chain ID to hex format
export function chainIdToHex(chainId: number): string {
  return `0x${chainId.toString(16)}`
}

// Format token amount with proper decimals
export function formatTokenAmount(
  amount: string | number | bigint, 
  decimals: number = 18, 
  displayDecimals: number = 4
): string {
  const num = typeof amount === 'bigint' 
    ? Number(amount) / Math.pow(10, decimals)
    : typeof amount === 'string' 
    ? parseFloat(amount) 
    : amount

  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals,
  })
}

// Format balance for display (alias for formatTokenAmount)
export function formatBalance(
  amount: string | number | bigint, 
  decimals: number = 18, 
  displayDecimals: number = 4
): string {
  return formatTokenAmount(amount, decimals, displayDecimals)
}

// Format balance with currency symbol
export function formatBalanceWithSymbol(
  amount: string | number | bigint,
  symbol: string = 'KAIA',
  decimals: number = 18,
  displayDecimals: number = 4
): string {
  const formatted = formatBalance(amount, decimals, displayDecimals)
  return `${formatted} ${symbol}`
}
