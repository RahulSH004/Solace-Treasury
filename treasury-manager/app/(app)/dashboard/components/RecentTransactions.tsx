'use client'

import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

interface Transaction {
  id: string
  reason: string | null
  amountSol: number
  amountUsd: number
  status: 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'FAILED'
  createdAt: string
  toWallet: string
}

const statusStyles = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800/50',
  APPROVED: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50',
  CONFIRMED: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/50',
  FAILED: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/50',
}

interface RecentTransactionsProps {
  transactions: Transaction[]
  onApprove: (id: string) => void
}

export function RecentTransactions({ transactions, onApprove }: RecentTransactionsProps) {
  return (
    <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] card-shadow overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.05] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
        <Link
          href="/transactions"
          className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 transition-colors"
        >
          View all
          <ArrowUpRight size={12} />
        </Link>
      </div>

      {/* Content */}
      {transactions.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🤖</span>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">No transactions yet.</p>
          <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Use the agent above to create one.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50 dark:divide-white/[0.03]">
          {transactions.slice(0, 5).map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-purple-50/30 dark:hover:bg-purple-950/10 transition-colors duration-150"
            >
              {/* Left: reason + wallet */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {tx.reason ?? 'No reason provided'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">
                  → {tx.toWallet.slice(0, 6)}...{tx.toWallet.slice(-4)}
                </p>
              </div>

              {/* Right: amount + status + approve */}
              <div className="flex items-center gap-3 ml-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {tx.amountSol} SOL
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    ${tx.amountUsd}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyles[tx.status]}`}
                >
                  {tx.status}
                </span>

                {tx.status === 'PENDING' && (
                  <button
                    onClick={() => onApprove(tx.id)}
                    className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-950/50 border border-purple-200 dark:border-purple-800/50 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    Approve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}