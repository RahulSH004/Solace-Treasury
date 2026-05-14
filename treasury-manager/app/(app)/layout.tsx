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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      {/* Main content — sidebar ke right mein */}
      <main className="ml-56 flex-1 p-8">
        {children}
      </main>
    </div>
  )
}