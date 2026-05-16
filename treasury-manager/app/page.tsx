'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LandingNavbar } from './components/landing/LandingNavbar'
import { Hero } from './components/landing/Hero'
import { Features } from './components/landing/Features'
import { HowItWorks } from './components/landing/HowItWorks'
import { Footer } from './components/landing/Footer'

export default function Home() {
  const { connected, publicKey } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (connected && publicKey) {
      router.push('/dashboard')
    }
  }, [connected, publicKey])

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <LandingNavbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Footer />
    </main>
  )
}