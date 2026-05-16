'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useCallback, useEffect, useState } from 'react'
import { TreasuryCard } from './components/TreasuryCard'
import { AgentCommand } from './components/AgentCommand'
import { RecentTransactions } from './components/RecentTransactions'

export default function Dashboard() {
  const { publicKey } = useWallet()
  const adminWallet = publicKey?.toString() ?? ''

  const [team, setTeam] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!adminWallet) return
    try {
      const [teamRes, txRes] = await Promise.all([
        fetch(`/api/teams?adminWallet=${adminWallet}`),
        fetch(`/api/transactions?adminWallet=${adminWallet}`)
      ])
      if (teamRes.ok) setTeam(await teamRes.json())
      if (txRes.ok) {
        const data = await txRes.json()
        setTransactions(data.transactions)
      }
    } finally {
      setLoading(false)
    }
  }, [adminWallet])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleApprove(txId: string) {
    await fetch(`/api/transactions/${txId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'APPROVED' })
    })
    fetchData()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading dashboard...</p>
      </div>
    </div>
  )

  if (!team) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">👥</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No team found</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Go to the <a href="/team" className="text-purple-600 dark:text-purple-400 hover:underline">Team page</a> to create your team.
        </p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Overview of your treasury and recent activity.
        </p>
      </div>

      <TreasuryCard
        repoOwner={team.repoOwner}
        repoName={team.repoName}
        treasuryPda={team.treasuryPda}
        transactions={transactions}
      />
      <AgentCommand
        adminWallet={adminWallet}
        onTransactionSaved={fetchData}
      />
      <RecentTransactions
        transactions={transactions}
        onApprove={handleApprove}
      />
    </div>
  )
}