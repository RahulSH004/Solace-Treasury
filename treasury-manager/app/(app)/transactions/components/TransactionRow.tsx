'use client'

import { ExternalLink } from 'lucide-react'
import { StatusBadge } from './StatusBadge'

type Status = 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'FAILED'

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

interface TransactionRowProps {
  tx: Transaction
  onClick: () => void
}

export function TransactionRow({ tx, onClick }: TransactionRowProps) {
  const date = new Date(tx.createdAt)
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick()
      }}
      className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-purple-50/40 dark:hover:bg-purple-950/10 transition-colors duration-150 group"
    >
      {/* Left: reason + wallet */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
          {tx.reason ?? 'No reason provided'}
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
            → {tx.toWallet.slice(0, 6)}...{tx.toWallet.slice(-4)}
          </p>
          {tx.txSignature && (
            <a
              href={`https://explorer.solana.com/tx/${tx.txSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-0.5 text-xs text-purple-500 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              Explorer
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>

      {/* Center: date */}
      <div className="hidden sm:block mx-6 text-right text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
        <span className="block">{dateStr}</span>
        <span className="block font-mono">{timeStr}</span>
      </div>

      {/* Right: amount + status */}
      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {tx.amountSol} SOL
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            ${tx.amountUsd}
          </p>
        </div>
        <StatusBadge status={tx.status} />
      </div>
    </div>
  )
}
