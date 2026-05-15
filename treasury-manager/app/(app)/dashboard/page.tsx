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
    <div className="flex items-center justify-center h-full">
      <p className="text-purple-600">Loading...</p>
    </div>
  )

  if (!team) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No team found</h2>
        <p className="text-gray-500">Go to Team page to create your team.</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <TreasuryCard
        repoOwner={team.repoOwner}
        repoName={team.repoName}
        treasuryPda={team.treasuryPda}
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