'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Sidebar } from '../components/Sidebar'

export default function AppLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { connected } = useWallet()
  const router = useRouter()

  // Wallet disconnect → landing pe
  useEffect(() => {
    if (!connected) router.push('/')
  }, [connected])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      {/* Main content — sidebar ke right mein */}
      <main className="ml-56 flex-1 p-8 max-w-[calc(100%-14rem)]">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}