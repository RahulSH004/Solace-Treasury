'use client'
import dynamic from 'next/dynamic'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ConnectWalletButton } from '@/app/components/connect_button'

export default function Home() {
  const { connected, publicKey } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (connected && publicKey) {
      router.push('/dashboard')
    }
  }, [connected, publicKey])

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <span className="text-xl font-bold">Solace</span>
        <ConnectWalletButton />
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center min-h-[90vh] text-center px-4">
        <h1 className="text-5xl font-bold mb-4">
          AI-Powered Team Treasury
        </h1>
        <p className="text-white/60 text-lg max-w-md mb-8">
          Manage your Solana team wallet with natural language.
          Pay contributors, track transactions, all with AI.
        </p>
        <ConnectWalletButton />
      </div>
    </main>
  )
}