import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Providers } from "@/components/providers"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KW Vault - AI-Driven Cross-Chain Yield Vault",
  description: "Maximize your USDT yields with AI-powered predictions and cross-chain DeFi strategies on Kaia",
  generator: "KW Vault",
  keywords: ["DeFi", "Yield Farming", "AI", "Cross-Chain", "Kaia", "USDT", "Vault"],
  authors: [{ name: "KW Vault Team" }],
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Suspense fallback={null}>
          <Providers>
            {children}
          </Providers>
        </Suspense>
      </body>
    </html>
  )
}
