'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowLeftRight } from 'lucide-react'
import { ExecuteTransfer } from './components/ExecuteTransfer'
import { TransactionDetail } from './components/TransactionDetail'
import { TransactionRow } from './components/TransactionRow'
import { StatusBadge } from './components/StatusBadge'

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

const filters: Filter[] = ['ALL', 'PENDING', 'APPROVED', 'CONFIRMED', 'FAILED']

export default function TransactionsPage() {
  const { publicKey } = useWallet()
  const adminWallet = publicKey?.toString() ?? ''

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<Filter>('ALL')
  const [loading, setLoading] = useState(true)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
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

  async function handleFail(txId: string) {
    await fetch(`/api/transactions/${txId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'FAILED' })
    })
    fetchData()
  }

  function openDetail(tx: Transaction) {
    setSelectedTx(tx)
    setDetailOpen(true)
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
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading transactions...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-md shadow-purple-500/20">
          <ArrowLeftRight size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            All treasury payments and transfers.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Sent', value: `${totalSol.toFixed(2)} SOL`, accent: false },
          { label: 'Pending Approvals', value: String(pending), accent: true },
          { label: 'Total Transactions', value: String(transactions.length), accent: false },
        ].map(({ label, value, accent }) => (
          <div
            key={label}
            className="rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] card-shadow p-5"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{label}</p>
            <p className={`text-2xl font-semibold ${accent ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150',
              filter === f
                ? 'solace-gradient-bg text-white shadow-sm'
                : 'bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-400'
            )}
          >
            {f}
            {f !== 'ALL' && (
              <span className="ml-1 opacity-70">
                {transactions.filter(t => t.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Transactions table */}
      <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] card-shadow overflow-hidden">
        {/* Table header */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.05] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {filter === 'ALL' ? 'All Transactions' : `${filter} Transactions`}
          </h3>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center mx-auto mb-3">
              <ArrowLeftRight size={20} className="text-purple-400" />
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">No transactions found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-white/[0.03]">
            {filtered.map(tx => (
              <div key={tx.id} className="relative">
                <TransactionRow tx={tx} onClick={() => openDetail(tx)} />

                {/* Approve / Reject — PENDING only — rendered below row */}
                {tx.status === 'PENDING' && team && (
                  <div
                    className="flex gap-2 px-4 pb-3 -mt-1"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
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
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFail(tx.id)
                      }}
                      className="border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 h-7 text-xs"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <TransactionDetail
        tx={selectedTx}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  )
}