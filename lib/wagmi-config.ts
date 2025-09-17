import { createConfig, http } from 'wagmi'
import { defineChain } from 'viem'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

/**
 * 🌟 KAIA CHAIN CONFIGURATIONS
 * Production-ready chain configs for Kaia ecosystem
 */

// Kaia Mainnet (Cypress) - chainId: 0x2019 (8217)
export const kaiaMainnet = defineChain({
  id: 8217,
  name: 'Kaia Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'KAIA',
    symbol: 'KAIA',
  },
  rpcUrls: {
    default: {
      http: ['https://public-en-node.klaytn.net'],
      webSocket: ['wss://public-en-node.klaytn.net/ws'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'KaiaScope', 
      url: 'https://kaiascope.com',
      apiUrl: 'https://api.kaiascope.com/api'
    },
  },
  testnet: false,
})

// Kaia Testnet (Kairos/Baobab) - chainId: 0x3e9 (1001)
export const kaiaTestnet = defineChain({
  id: 1001,
  name: 'Kaia Kairos Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'KAIA',
    symbol: 'KAIA',
  },
  rpcUrls: {
    default: {
      http: ['https://public-en-kairos.node.kaia.io'],
      webSocket: ['wss://public-en-kairos.node.kaia.io/ws'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'KaiaScope Testnet', 
      url: 'https://kairos.kaiascope.com',
      apiUrl: 'https://api-kairos.kaiascope.com/api'
    },
  },
  testnet: true,
})

/**
 * 🔧 WAGMI CONFIGURATION
 * Clean setup without RainbowKit - optimized for Kaia ecosystem
 */
export const wagmiConfig = createConfig({
  chains: [kaiaMainnet, kaiaTestnet],
  connectors: [
    // MetaMask specific connector
    injected({
      target: () => ({
        id: 'metamask',
        name: 'MetaMask',
        provider: typeof window !== 'undefined' && (window as any)?.ethereum?.isMetaMask 
          ? (window as any).ethereum 
          : undefined,
      }),
    }),
    // Kaia Wallet specific connector
    injected({
      target: () => ({
        id: 'kaia',
        name: 'Kaia Wallet',
        provider: typeof window !== 'undefined' && ((window as any)?.kaia || (window as any)?.klaytn)
          ? ((window as any)?.kaia || (window as any)?.klaytn)
          : undefined,
      }),
    }),
    // OKX Wallet specific connector
    injected({
      target: () => ({
        id: 'okx',
        name: 'OKX Wallet',
        provider: typeof window !== 'undefined' && (window as any)?.okxwallet
          ? (window as any).okxwallet
          : undefined,
      }),
    }),
    // Generic injected for other wallets
    injected({
      target: () => ({
        id: 'injected',
        name: 'Browser Wallet',
        provider: typeof window !== 'undefined' ? (window as any)?.ethereum : undefined,
      }),
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
      showQrModal: false,
    }),
    coinbaseWallet({
      appName: 'KW Vault',
    }),
  ],
  transports: {
    [kaiaMainnet.id]: http('https://public-en-node.klaytn.net'),
    [kaiaTestnet.id]: http('https://public-en-kairos.node.kaia.io'),
  },
})

/**
 * 🎯 CHAIN UTILITIES
 * Helper functions for chain operations
 */

// Chain switching parameters for wallet_addEthereumChain
export const KAIA_CHAIN_PARAMS = {
  mainnet: {
    chainId: '0x2019', // 8217 in hex
    chainName: 'Kaia Mainnet',
    nativeCurrency: {
      name: 'KAIA',
      symbol: 'KAIA',
      decimals: 18,
    },
    rpcUrls: ['https://public-en-node.klaytn.net'],
    blockExplorerUrls: ['https://kaiascope.com'],
  },
  testnet: {
    chainId: '0x3e9', // 1001 in hex
    chainName: 'Kaia Kairos Testnet',
    nativeCurrency: {
      name: 'KAIA',
      symbol: 'KAIA',
      decimals: 18,
    },
    rpcUrls: ['https://public-en-kairos.node.kaia.io'],
    blockExplorerUrls: ['https://kairos.kaiascope.com'],
  },
} as const

// Default chain for the app
export const DEFAULT_CHAIN = kaiaTestnet // Use testnet for development

// Supported chain IDs
export const SUPPORTED_CHAIN_IDS = [kaiaMainnet.id, kaiaTestnet.id] as const

// Check if chain is supported
export const isSupportedChain = (chainId: number): boolean => {
  return SUPPORTED_CHAIN_IDS.includes(chainId as any)
}

// Wallet detection utilities
export const getAvailableWallets = () => {
  if (typeof window === 'undefined') return []
  
  const wallets = []
  
  // Check MetaMask
  if ((window as any)?.ethereum?.isMetaMask) {
    wallets.push({ id: 'metamask', name: 'MetaMask', available: true })
  }
  
  // Check Kaia Wallet
  if ((window as any)?.kaia || (window as any)?.klaytn) {
    wallets.push({ id: 'kaia', name: 'Kaia Wallet', available: true })
  }
  
  // Check OKX Wallet
  if ((window as any)?.okxwallet) {
    wallets.push({ id: 'okx', name: 'OKX Wallet', available: true })
  }
  
  return wallets
}

// Force disconnect from all providers
export const forceDisconnectAll = async () => {
  if (typeof window === 'undefined') return
  
  try {
    // Disconnect from MetaMask
    if ((window as any)?.ethereum?.isMetaMask) {
      await (window as any).ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      })
    }
    
    // Clear localStorage
    localStorage.removeItem('wagmi.store')
    localStorage.removeItem('wagmi.cache')
    localStorage.removeItem('wagmi.connected')
    
    // Reload page to reset all providers
    window.location.reload()
  } catch (error) {
    console.log('Disconnect error:', error)
  }
}
