'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Transaction {
  id: string
  reason: string | null
  amountSol: number
  amountUsd: number
  status: 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'FAILED'
  createdAt: string
  toWallet: string
}

const statusColor = {
  PENDING:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  APPROVED:  'bg-blue-50 text-blue-700 border-blue-200',
  CONFIRMED: 'bg-green-50 text-green-700 border-green-200',
  FAILED:    'bg-red-50 text-red-700 border-red-200',
}

interface RecentTransactionsProps {
  transactions: Transaction[]
  onApprove: (id: string) => void
}

export function RecentTransactions({ transactions, onApprove }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <Card className="border-purple-100">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400 text-center py-6">
            No transactions yet. Use the agent to create one.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-100">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.slice(0, 5).map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between py-2 border-b border-purple-50 last:border-0"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {tx.reason ?? 'No reason'}
              </p>
              <p className="text-xs text-gray-400 font-mono">
                {tx.toWallet.slice(0, 6)}...{tx.toWallet.slice(-4)}
              </p>
            </div>

            <div className="flex items-center gap-3 ml-4">
              <span className="text-sm font-semibold text-gray-900">
                {tx.amountSol} SOL
              </span>
              <Badge
                variant="outline"
                className={statusColor[tx.status]}
              >
                {tx.status}
              </Badge>

              {/* Approve button — sirf PENDING pe */}
              {tx.status === 'PENDING' && (
                <button
                  onClick={() => onApprove(tx.id)}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                >
                  Approve
                </button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}