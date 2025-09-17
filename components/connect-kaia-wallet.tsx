"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  Wallet, 
  ChevronDown, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Copy,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff,
  Settings,
  Shield,
  Zap,
  Network,
  Check,
  X,
  WifiOff,
  Wifi,
  ArrowRight,
  Lock
} from 'lucide-react'

// Import actual wagmi hooks
import { useAccount, useConnect, useDisconnect, useSwitchChain, useBalance } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Import actual wagmi config
import { 
  kaiaMainnet, 
  kaiaTestnet, 
  KAIA_CHAIN_PARAMS, 
  isSupportedChain 
} from '@/lib/wagmi-config'

interface ConnectKaiaWalletProps {
  showNetworkSwitcher?: boolean
  showBalance?: boolean
  compact?: boolean
  className?: string
}

export function ConnectKaiaWallet({ 
  showNetworkSwitcher: propShowNetworkSwitcher = true,
  showBalance: propShowBalance = true,
  compact: propCompact = false,
  className = ""
}: ConnectKaiaWalletProps = {}) {
  // Actual wagmi hooks
  const { address, isConnected, chain, connector } = useAccount()
  const { connect, connectors, isPending: isConnecting, error: connectError } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const { data: balance, refetch: refetchBalance } = useBalance({
    address,
    query: { enabled: !!address && propShowBalance }
  })

  // Component state
  const [isAddingChain, setIsAddingChain] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [showFullAddress, setShowFullAddress] = useState(false)
  const [showNetworkSwitcher, setShowNetworkSwitcher] = useState(propShowNetworkSwitcher)
  const [showBalance] = useState(propShowBalance)
  const [compact, setCompact] = useState(propCompact)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Enhanced wallet data with better icons and info
  const SUPPORTED_WALLETS = [
    {
      id: 'metamask',
      name: 'MetaMask',
      description: 'Most popular Ethereum wallet',
      icon: '🦊',
      installed: true,
      gradient: 'from-orange-400 to-orange-600',
      downloadUrl: 'https://metamask.io/download/'
    },
    {
      id: 'kaikas',
      name: 'Kaikas',
      description: 'Official Kaia wallet',
      icon: '🐾',
      installed: true,
      gradient: 'from-blue-400 to-blue-600',
      downloadUrl: 'https://docs.klaytn.foundation/content/dapp/tutorials/connecting-to-klaytn-network'
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      description: 'Connect any wallet',
      icon: '🔗',
      installed: true,
      gradient: 'from-purple-400 to-purple-600'
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      description: 'Secure self-custody wallet',
      icon: '🔵',
      installed: false,
      gradient: 'from-blue-500 to-indigo-600',
      downloadUrl: 'https://www.coinbase.com/wallet'
    }
  ]

  // Networks data
  const NETWORKS = [
    {
      id: 8217,
      name: 'Kaia Mainnet',
      type: 'mainnet',
      icon: '⚡',
      color: 'from-green-400 to-emerald-500'
    },
    {
      id: 1001,
      name: 'Kaia Testnet',
      type: 'testnet',
      icon: '🧪',
      color: 'from-orange-400 to-amber-500'
    }
  ]

  // Utility functions
  const formatAddress = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''
  const formatBalance = (bal: string) => parseFloat(bal || '0').toFixed(4)

  // Clear errors when connection state changes
  useEffect(() => {
    if (isConnected) {
      setError(null)
    }
  }, [isConnected])

  // Enhanced wallet connection handler
  const handleConnect = async (walletId: string) => {
    try {
      setError(null)
      console.log(`🔗 Attempting to connect ${walletId} wallet...`)
      
      // Debug: Log available connectors
      console.log('Available connectors:', connectors.map(c => ({ id: c.id, name: c.name })))
      
      let connector
      
      // Enhanced connector selection logic
      switch (walletId) {
        case 'metamask':
          // Enhanced MetaMask detection and connection
          if (!window.ethereum?.isMetaMask) {
            throw new Error('MetaMask is not installed. Please install MetaMask extension.')
          }
          connector = connectors.find(c => c.id === 'metamask')
          break
          
        case 'kaikas':
          // Enhanced Kaikas detection and connection
          const kaiaProvider = (window as any)?.kaia || (window as any)?.klaytn
          if (!kaiaProvider) {
            throw new Error('Kaikas wallet is not installed. Please install Kaikas extension.')
          }
          connector = connectors.find(c => c.id === 'kaia')
          break
          
        case 'walletconnect':
          connector = connectors.find(c => c.id === 'walletConnect')
          if (!connector) {
            throw new Error('WalletConnect is not available. Please check your internet connection.')
          }
          break
          
        case 'coinbase':
          connector = connectors.find(c => c.id === 'coinbaseWallet')
          if (!connector) {
            throw new Error('Coinbase Wallet connector is not available.')
          }
          break
          
        case 'injected':
        default:
          // Generic injected wallet
          if (!window.ethereum) {
            throw new Error('No wallet detected. Please install a Web3 wallet like MetaMask.')
          }
          connector = connectors.find(c => c.id === 'injected')
          break
      }
      
      if (!connector) {
        throw new Error(`${walletId} connector not found. Please refresh the page and try again.`)
      }
      
      console.log(`✅ Using connector: ${connector.id} (${connector.name})`)
      
      // Attempt connection with timeout
      const connectPromise = connect({ connector })
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout. Please try again.')), 30000)
      )
      
      await Promise.race([connectPromise, timeoutPromise])
      
      console.log(`🎉 Successfully connected ${walletId} wallet!`)
      
    } catch (err: any) {
      console.error(`❌ Connection failed for ${walletId}:`, err)
      
      // Enhanced error messages
      let errorMessage = err.message || 'Failed to connect wallet'
      
      if (err.code === 4001) {
        errorMessage = 'Connection rejected by user. Please try again and approve the connection.'
      } else if (err.message?.includes('User rejected')) {
        errorMessage = 'Connection cancelled. Please approve the wallet connection to continue.'
      } else if (err.message?.includes('timeout')) {
        errorMessage = 'Connection timed out. Please check your wallet and try again.'
      } else if (err.message?.includes('not installed')) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    }
  }

  const handleCopyAddress = async () => {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDisconnect = () => {
    disconnect()
  }

  // Handle chain switching
  const handleSwitchChain = async (targetChainId: number) => {
    try {
      setError(null)
      await switchChain({ chainId: targetChainId })
    } catch (err: any) {
      console.error('Chain switch failed:', err)
      if (err.code === 4902 || err.message?.includes('Unrecognized chain')) {
        await handleAddChain(targetChainId)
      } else {
        setError(`Failed to switch chain: ${err.message}`)
      }
    }
  }

  // Add chain to wallet
  const handleAddChain = async (chainId: number) => {
    try {
      setIsAddingChain(true)
      setError(null)

      const chainParams = chainId === kaiaMainnet.id 
        ? KAIA_CHAIN_PARAMS.mainnet 
        : KAIA_CHAIN_PARAMS.testnet

      await window.ethereum?.request({
        method: 'wallet_addEthereumChain',
        params: [chainParams],
      })

      await handleSwitchChain(chainId)
    } catch (err: any) {
      console.error('Add chain failed:', err)
      setError(`Failed to add chain: ${err.message}`)
    } finally {
      setIsAddingChain(false)
    }
  }

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Computed values
  const availableWallets = getAvailableWallets()
  const isWrongChain = isConnected && chain && !isSupportedChain(chain.id)
  const isLoading = isConnecting || isSwitching || isAddingChain

  // Define wallet interface
  interface WalletOption {
    id: string
    name: string
    icon: string
    description: string
    installed: boolean
  }

  // Get available wallets with improved detection
  function getAvailableWallets(): WalletOption[] {
    const wallets: WalletOption[] = []
    
    if (typeof window === 'undefined') return wallets
    
    // Enhanced MetaMask detection (most reliable)
    if (window.ethereum?.isMetaMask && !(window.ethereum as any)?.isOkxWallet && !(window.ethereum as any)?.isCryptoCom) {
      wallets.push({ 
        id: 'metamask', 
        name: 'MetaMask', 
        icon: '🦊', 
        description: 'Most popular Ethereum wallet',
        installed: true
      })
    }
    
    // Enhanced Kaikas detection (prioritize over other wallets)
    if ((window as any)?.klaytn?.isKaikas || (window as any)?.kaia) {
      wallets.push({ 
        id: 'kaikas', 
        name: 'Kaikas', 
        icon: '🐾', 
        description: 'Official Kaia wallet',
        installed: true
      })
    }
    
    // WalletConnect (always available)
    wallets.push({ 
      id: 'walletconnect', 
      name: 'WalletConnect', 
      icon: '🔗', 
      description: 'Connect any wallet via QR code',
      installed: true
    })
    
    // Coinbase Wallet
    if ((window.ethereum as any)?.isCoinbaseWallet) {
      wallets.push({ 
        id: 'coinbase', 
        name: 'Coinbase Wallet', 
        icon: '🔵', 
        description: 'Coinbase Wallet',
        installed: true
      })
    }
    
    // Generic fallback only if no specific wallets detected
    if (window.ethereum && wallets.length === 0) {
      wallets.push({ 
        id: 'injected', 
        name: 'Browser Wallet', 
        icon: '🌐', 
        description: 'Connect with browser wallet',
        installed: true
      })
    }
    
    return wallets
  }

  // Wallet Selection Component
  const WalletSelection = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Choose your preferred wallet to access Kaia network
          </p>
        </div>
      </div>

      {/* Wallet Grid */}
      <div className="grid gap-3">
        {availableWallets.map((wallet) => (
          <div
            key={wallet.id}
            onClick={() => !isLoading && handleConnect(wallet.id)}
            className="group relative p-6 card-gradient border-2 border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer overflow-hidden hover:scale-[1.02]"
          >
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative flex items-center gap-4">
              {/* Wallet Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-110">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="text-2xl">{wallet.icon}</span>
                )}
              </div>

              {/* Wallet Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-gradient">
                    {wallet.name}
                  </h3>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 text-xs rounded-full border border-green-500/30">
                    <Shield className="w-3 h-3" />
                    Ready
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {wallet.description}
                </p>
              </div>

              {/* Status Icon */}
              <div className="flex items-center">
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transform group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Connection Status */}
      {isLoading && (
        <div className="flex items-center justify-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
          <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
          <span className="text-amber-800 dark:text-amber-200 font-medium">
            Connecting wallet...
          </span>
        </div>
      )}

      {/* Help Section */}
      <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          New to wallets?{' '}
          <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Learn how to get started
          </a>
        </p>
      </div>
    </div>
  )

  // Connected State Component
  const ConnectedState = () => (
    <div className="space-y-4">
      {/* Connection Status Header */}
      <div className="relative p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }} />
        </div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Wallet Connected</h3>
                <p className="text-green-100 text-sm">You're ready to interact with Kaia</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-sm font-medium">{chain?.name}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/30 transition-colors text-center">
              <Zap className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs font-medium">Send</span>
            </button>
            <button className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/30 transition-colors text-center">
              <RefreshCw className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs font-medium">Swap</span>
            </button>
            <button className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/30 transition-colors text-center">
              <Network className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs font-medium">Bridge</span>
            </button>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Address Section */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Wallet Address
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFullAddress(!showFullAddress)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                {showFullAddress ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={handleCopyAddress}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                {copiedAddress ? (
                  <>
                    <Check className="w-3 h-3 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="font-mono text-sm p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            {showFullAddress ? address : formatAddress(address || '')}
          </div>
        </div>

        {/* Balance Section */}
        {showBalance && balance && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Balance
              </label>
              <button
                onClick={() => refetchBalance()}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {formatBalance(balance.formatted)} {balance.symbol}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              ≈ $324.58 USD
            </p>
          </div>
        )}
      </div>

      {/* Network Switcher */}
      {showNetworkSwitcher && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Network className="w-5 h-5" />
            Switch Network
          </h4>
          <div className="space-y-2">
            {NETWORKS.map((network) => (
              <button
                key={network.id}
                onClick={() => handleSwitchChain(network.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  chain?.id === network.id
                    ? `bg-gradient-to-r ${network.color} text-white shadow-lg`
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  chain?.id === network.id
                    ? 'bg-white/20'
                    : `bg-gradient-to-r ${network.color}`
                }`}>
                  <span className={chain?.id === network.id ? 'text-white' : 'text-white'}>
                    {network.icon}
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{network.name}</div>
                </div>
                {chain?.id === network.id && (
                  <CheckCircle className="w-5 h-5" />
                )}
                {network.type === 'testnet' && (
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    chain?.id === network.id
                      ? 'bg-white/20 text-white'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                  }`}>
                    TEST
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Disconnect Button */}
      <button
        onClick={handleDisconnect}
        className="w-full flex items-center justify-center gap-2 p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors border border-red-200 dark:border-red-800"
      >
        <LogOut className="w-4 h-4" />
        Disconnect Wallet
      </button>
    </div>
  )

  // Compact Mode Component
  const CompactMode = () => (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all font-medium ${
          isConnected
            ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-2 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/50'
            : 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/50'
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500 animate-pulse' : 'bg-blue-500'
        }`} />
        <span>
          {isConnected ? formatAddress(address || '') : 'Connect Wallet'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-96 z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-6">
            {isConnected ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">Connected</div>
                  <div className="text-sm text-muted-foreground">Wallet is connected</div>
                </div>
                <Button onClick={handleDisconnect} variant="outline" className="w-full">
                  Disconnect
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-lg font-semibold">Connect Wallet</div>
                  <div className="text-sm text-muted-foreground">Choose your wallet</div>
                </div>
                {availableWallets.map((wallet) => (
                  <Button
                    key={wallet.id}
                    onClick={() => handleConnect(wallet.id)}
                    variant="outline"
                    className="w-full justify-start gap-3"
                  >
                    <span className="text-xl">{wallet.icon}</span>
                    {wallet.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )

  // Error Display
  const ErrorDisplay = () => error && (
    <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800 dark:text-red-200 font-medium">{error}</span>
        </div>
        <button
          onClick={() => setError(null)}
          className="text-red-400 hover:text-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  // Demo Controls
  const DemoControls = () => (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-lg space-y-2">
      <h4 className="font-semibold text-sm">Demo Controls</h4>
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={compact}
            onChange={(e) => setCompact(e.target.checked)}
            className="rounded"
          />
          Compact Mode
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showNetworkSwitcher}
            onChange={(e) => setShowNetworkSwitcher(e.target.checked)}
            className="rounded"
          />
          Show Network Switcher
        </label>
      </div>
    </div>
  )

  // Not connected - show connect options
  if (!isConnected) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Error Display */}
        {(error || connectError) && (
          <Alert variant="destructive" className="animate-slide-up">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || connectError?.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Wallet Options */}
        {availableWallets.length > 0 ? (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg animate-glow">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gradient">Connect Your Wallet</h3>
              <p className="text-sm text-muted-foreground">Choose your preferred wallet to connect to Kaia network</p>
            </div>
            
            <div className="space-y-3">
              {availableWallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleConnect(wallet.id)}
                  disabled={isLoading}
                  className="w-full group relative p-4 card-gradient border-2 border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer overflow-hidden hover:scale-[1.02] text-left"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300">
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span className="text-xl">{wallet.icon}</span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-semibold text-gradient">{wallet.name}</div>
                      <div className="text-sm text-muted-foreground">{wallet.description}</div>
                    </div>
                    
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transform group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="card-gradient p-8 text-center space-y-4">
            <Wallet className="w-16 h-16 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-xl font-bold">No Wallet Detected</h3>
              <p className="text-muted-foreground">Please install MetaMask, Kaikas, or another Ethereum wallet to continue.</p>
            </div>
            <Button variant="outline" asChild className="glass border-white/20 hover:border-white/30">
              <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="gap-2">
                Install MetaMask <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Connected but wrong chain
  if (isWrongChain) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert variant="destructive" className="animate-slide-up">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please switch to Kaia Mainnet or Testnet to continue.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            onClick={() => handleSwitchChain(kaiaMainnet.id)}
            disabled={isLoading}
            className="btn-primary gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Switch to Mainnet
          </Button>
          <Button
            onClick={() => handleSwitchChain(kaiaTestnet.id)}
            disabled={isLoading}
            variant="outline"
            className="glass border-white/20 hover:border-white/30 gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Switch to Testnet
          </Button>
        </div>
      </div>
    )
  }

  // Connected and correct chain - show wallet info
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status */}
      <div className="card-gradient animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25 animate-glow">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-gradient">Connected</div>
              {chain && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  {chain.name}
                </Badge>
              )}
            </div>
          </div>
          
          <Button
            onClick={handleDisconnect}
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </Button>
        </div>

        {/* Address Display */}
        {address && (
          <div className="space-y-3">
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Wallet Address</span>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowFullAddress(!showFullAddress)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    {showFullAddress ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                  <Button
                    onClick={handleCopyAddress}
                    variant="ghost"
                    size="sm"
                    className="gap-1 h-6"
                  >
                    {copiedAddress ? (
                      <>
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-green-500 text-xs">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="text-xs">Copy</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <code className="text-sm font-mono block p-2 bg-muted/50 rounded border-2 border-dashed">
                {showFullAddress ? address : formatAddress(address || '')}
              </code>
            </div>

            {/* Balance */}
            {showBalance && balance && (
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Balance</span>
                  <Button
                    onClick={() => refetchBalance()}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>
                <div className="text-2xl font-bold text-gradient">
                  {formatBalance(balance?.formatted || '0')} {balance?.symbol || 'KAIA'}
                </div>
                <div className="text-sm text-muted-foreground">≈ $324.58 USD</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Network Switcher */}
      {showNetworkSwitcher && (
        <div className="card-gradient animate-slide-up" style={{animationDelay: '0.1s'}}>
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" />
            Switch Network
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleSwitchChain(kaiaMainnet.id)}
              disabled={isLoading || chain?.id === kaiaMainnet.id}
              className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                chain?.id === kaiaMainnet.id
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-white/20 hover:border-green-500/50 hover:bg-green-500/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">K</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Kaia Mainnet</div>
                  <div className="text-sm text-muted-foreground">Production network</div>
                </div>
                {chain?.id === kaiaMainnet.id && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
            </button>
            
            <button
              onClick={() => handleSwitchChain(kaiaTestnet.id)}
              disabled={isLoading || chain?.id === kaiaTestnet.id}
              className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                chain?.id === kaiaTestnet.id
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-white/20 hover:border-orange-500/50 hover:bg-orange-500/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Kaia Testnet</div>
                  <div className="text-sm text-muted-foreground">Development network</div>
                </div>
                {chain?.id === kaiaTestnet.id && (
                  <CheckCircle className="w-5 h-5 text-orange-500" />
                )}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="animate-slide-up">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Default export for compatibility
export default ConnectKaiaWallet

// Additional exports for different use cases
export { ConnectKaiaWallet as EnhancedKaiaWallet }

// Compact wallet button for header usage
export function CompactWalletButton({ className = "" }: { className?: string }) {
  return <ConnectKaiaWallet compact={true} className={className} showNetworkSwitcher={false} />
}