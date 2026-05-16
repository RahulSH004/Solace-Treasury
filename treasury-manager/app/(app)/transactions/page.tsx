'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ExecuteTransfer } from './components/ExecuteTransfer'

type Status = 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'FAILED'
type Filter = 'ALL' | Status

interface Transaction {
  id: string
  reason: string | null
  amountSol: number
  amountUsd: number
  status: Status
  createdAt: string
  toWallet: string
  txSignature: string | null
}

const statusColor: Record<Status, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  APPROVED: 'bg-blue-50 text-blue-700 border-blue-200',
  CONFIRMED: 'bg-green-50 text-green-700 border-green-200',
  FAILED: 'bg-red-50 text-red-700 border-red-200',
}

const filters: Filter[] = ['ALL', 'PENDING', 'APPROVED', 'CONFIRMED', 'FAILED']

export default function TransactionsPage() {
  const { publicKey } = useWallet()
  const adminWallet = publicKey?.toString() ?? ''

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<Filter>('ALL')
  const [loading, setLoading] = useState(true)

  const fetchTransactions = useCallback(async () => {
    if (!adminWallet) return
    try {
      const res = await fetch(`/api/transactions?adminWallet=${adminWallet}`)
      if (res.ok) {
        const data = await res.json()
        setTransactions(data.transactions)
      }
    } finally {
      setLoading(false)
    }
  }, [adminWallet])

  // fetchTransactions ke saath team bhi fetch karo
  const [team, setTeam] = useState<any>(null)

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
    fetchTransactions()
  }

  async function handleFail(txId: string) {
    await fetch(`/api/transactions/${txId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'FAILED' })
    })
    fetchTransactions()
  }

  const filtered = filter === 'ALL'
    ? transactions
    : transactions.filter(tx => tx.status === filter)

  // Stats
  const totalSol = transactions
    .filter(tx => tx.status === 'CONFIRMED')
    .reduce((sum, tx) => sum + tx.amountSol, 0)

  const pending = transactions.filter(tx => tx.status === 'PENDING').length

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-purple-600">Loading...</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-purple-100">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Total Sent</p>
            <p className="text-2xl font-bold text-gray-900">{totalSol.toFixed(2)} SOL</p>
          </CardContent>
        </Card>
        <Card className="border-purple-100">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Pending Approvals</p>
            <p className="text-2xl font-bold text-yellow-600">{pending}</p>
          </CardContent>
        </Card>
        <Card className="border-purple-100">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium transition-colors',
              filter === f
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <Card className="border-purple-100">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">
            {filter === 'ALL' ? 'All Transactions' : `${filter} Transactions`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No transactions found.
            </p>
          ) : (
            <div className="space-y-3">
              {filtered.map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 border-b border-purple-50 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {tx.reason ?? 'No reason provided'}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      To: {tx.toWallet.slice(0, 6)}...{tx.toWallet.slice(-4)}
                    </p>
                    {tx.txSignature && (
                      <p className="text-xs text-purple-400 font-mono">
                        Sig: {tx.txSignature.slice(0, 8)}...
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {tx.amountSol} SOL
                      </p>
                      <p className="text-xs text-gray-400">
                        ${tx.amountUsd}
                      </p>
                    </div>
                    <Badge variant="outline" className={statusColor[tx.status]}>
                      {tx.status}
                    </Badge>

                    {/* Approve / Reject — PENDING only */}
                    {tx.status === 'PENDING' && team && (
                      <div className="flex gap-2">
                        <ExecuteTransfer
                          transactionId={tx.id}
                          teamName={team.repoName}
                          treasuryPda={team.treasuryPda}
                          recipientWallet={tx.toWallet}
                          amountSol={tx.amountSol}
                          onSuccess={fetchData}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFail(tx.id)}
                          className="border-red-200 text-red-500 hover:bg-red-50 h-7 text-xs"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}