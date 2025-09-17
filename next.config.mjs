/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['better-sqlite3'],
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    
    // Fix for MetaMask SDK and other wallet dependencies
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    }
    
    // Ignore problematic modules
    config.ignoreWarnings = [
      { module: /node_modules\/uuid/ },
      { module: /node_modules\/@metamask/ },
      { module: /node_modules\/@walletconnect/ },
    ]
    
    return config
  },
}

export default nextConfig