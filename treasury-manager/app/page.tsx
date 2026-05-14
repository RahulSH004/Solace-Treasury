'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ConnectWalletButton } from './components/connect_button'
import { Navbar } from './components/Navbar'

export default function Home() {
  const { connected, publicKey } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (connected && publicKey) {
      router.push('/dashboard')
    }
  }, [connected, publicKey])

  return (
    <main className="min-h-screen bg-white">
      {/* Navbar — sirf logo + connect button landing pe */}
      <nav className="border-b border-purple-100 px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-purple-600">Solace</span>
          <ConnectWalletButton />
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center min-h-[90vh] text-center px-4">
        <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 text-sm px-3 py-1 rounded-full mb-6">
          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
          Solana Devnet
        </div>

        <h1 className="text-5xl font-bold text-gray-900 mb-4 max-w-xl">
          AI-Powered Team Treasury
        </h1>

        <p className="text-gray-500 text-lg max-w-md mb-8">
          Manage your Solana team wallet with natural language.
          Pay contributors, track transactions — all with AI.
        </p>

        <ConnectWalletButton />
      </div>
    </main>
  )
}