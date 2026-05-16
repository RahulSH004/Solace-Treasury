'use client'

import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import { RefreshCw, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { FaGithub } from 'react-icons/fa'
import { TreasuryMiniChart } from './TreasuryMiniChart'
import { ContributionHeatmap } from './ContributionHeatmap'

interface Transaction {
  amountSol: number
  status: string
  createdAt: string
}

interface TreasuryCardProps {
  repoOwner: string
  repoName: string
  treasuryPda: string | null
  transactions?: Transaction[]
}

export function TreasuryCard({ repoOwner, repoName, treasuryPda, transactions = [] }: TreasuryCardProps) {
  const { connection } = useConnection()
  const [solBalance, setSolBalance] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  async function fetchBalance() {
    if (!treasuryPda) return
    try {
      const pubkey = new PublicKey(treasuryPda!)
      const lamports = await connection.getBalance(pubkey)
      setSolBalance(lamports / LAMPORTS_PER_SOL)
    } catch {
      setSolBalance(0)
    }
  }

  useEffect(() => {
    if (!treasuryPda) return
    fetchBalance()
    const interval = setInterval(fetchBalance, 30000)
    return () => clearInterval(interval)
  }, [treasuryPda, connection])

  async function handleRefresh() {
    setRefreshing(true)
    await fetchBalance()
    setTimeout(() => setRefreshing(false), 600)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Treasury Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] card-shadow card-lift p-6">
        {/* Purple top border accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5 solace-gradient-bg" />

        {/* Background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 dark:bg-purple-500/8 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center">
                <TrendingUp size={15} className="text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Treasury Balance
              </p>
            </div>

            <button
              onClick={handleRefresh}
              className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
              aria-label="Refresh balance"
            >
              <RefreshCw
                size={14}
                className={refreshing ? 'animate-spin text-purple-500' : ''}
              />
            </button>
          </div>

          {/* Balance display */}
          {treasuryPda ? (
            solBalance !== null ? (
              <div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {solBalance.toFixed(4)}
                  </span>
                  <span className="text-lg font-medium text-purple-600 dark:text-purple-400 mb-0.5">
                    SOL
                  </span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-2 truncate">
                  {treasuryPda.slice(0, 16)}...{treasuryPda.slice(-8)}
                </p>
                <TreasuryMiniChart
                  transactions={transactions}
                  currentBalance={solBalance}
                />
              </div>
            ) : (
              <div className="space-y-2 mt-2">
                <div className="h-9 w-40 rounded-lg animate-shimmer bg-gray-100 dark:bg-white/[0.04]" />
                <div className="h-3 w-48 rounded animate-shimmer bg-gray-100 dark:bg-white/[0.04]" />
              </div>
            )
          ) : (
            <div>
              <span className="text-3xl font-semibold text-gray-300 dark:text-gray-600">—</span>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Not initialized yet</p>
            </div>
          )}
        </div>
      </div>

      {/* GitHub Repo Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] card-shadow card-lift p-6">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white/20 dark:to-white/10" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white/10 flex items-center justify-center">
              <FaGithub size={15} className="text-white dark:text-gray-200" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              GitHub Repository
            </p>
          </div>

          <div className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
            {repoOwner}
            <span className="text-gray-400 dark:text-gray-500 font-normal mx-1">/</span>
            {repoName}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Badge
              variant="outline"
              className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/60 bg-purple-50 dark:bg-purple-950/30 text-xs"
            >
              Devnet
            </Badge>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-400 dark:text-gray-500">Connected</span>
          </div>

          {/* Contribution heatmap — blends into card with bottom fade */}
          <div className="relative mt-1 -mx-1">
            <ContributionHeatmap repoOwner={repoOwner} repoName={repoName} />
            {/* Soft fade edges so heatmap dissolves into card */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white dark:from-[#111111] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white dark:from-[#111111] to-transparent" />
          </div>
        </div>
      </div>
    </div>
  )
}