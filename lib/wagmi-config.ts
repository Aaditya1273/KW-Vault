import { createConfig, http } from "wagmi"
import { injected, walletConnect } from "wagmi/connectors"

// Kaia chain configuration
const kaiaChain = {
  id: 8217,
  name: "Kaia Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "KAIA",
    symbol: "KAIA",
  },
  rpcUrls: {
    default: {
      http: ["https://public-en-node.klaytn.net"],
    },
  },
  blockExplorers: {
    default: { name: "KaiaScope", url: "https://kaiascope.com" },
  },
}

const kaiaTestnet = {
  id: 1001,
  name: "Kaia Kairos Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "KAIA",
    symbol: "KAIA",
  },
  rpcUrls: {
    default: {
      http: ["https://public-en-kairos.node.kaia.io"],
    },
  },
  blockExplorers: {
    default: { name: "KaiaScope Testnet", url: "https://kairos.kaiascope.com" },
  },
}

export const config = createConfig({
  chains: [kaiaChain, kaiaTestnet],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    }),
  ],
  transports: {
    [kaiaChain.id]: http(),
    [kaiaTestnet.id]: http(),
  },
})
