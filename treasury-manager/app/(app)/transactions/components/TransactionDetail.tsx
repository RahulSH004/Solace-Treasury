import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface Transaction {
  id: string
  reason: string | null
  amountSol: number
  amountUsd: number
  status: 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'FAILED'
  createdAt: string
  toWallet: string
  txSignature: string | null
}

const statusColor = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  APPROVED: 'bg-blue-50 text-blue-700 border-blue-200',
  CONFIRMED: 'bg-green-50 text-green-700 border-green-200',
  FAILED: 'bg-red-50 text-red-700 border-red-200',
}

interface TransactionDetailProps {
  tx: Transaction | null
  open: boolean
  onClose: () => void
}

export function TransactionDetail({ tx, open, onClose }: TransactionDetailProps) {
  if (!tx) return null

  const date = new Date(tx.createdAt)

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Transaction Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Status</span>
            <Badge variant="outline" className={statusColor[tx.status]}>
              {tx.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Reason</span>
            <span className="text-sm text-gray-900 text-right max-w-xs">
              {tx.reason ?? '—'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Amount</span>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{tx.amountSol} SOL</p>
              <p className="text-xs text-gray-400">${tx.amountUsd}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Recipient</span>
            <span className="text-xs font-mono text-gray-600 break-all text-right max-w-xs">
              {tx.toWallet}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">ID</span>
            <span className="text-xs font-mono text-gray-400">{tx.id}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Date</span>
            <span className="text-sm text-gray-600">
              {date.toLocaleDateString()} {date.toLocaleTimeString()}
            </span>
          </div>

          {tx.txSignature && (
            <div className="space-y-1">
              <span className="text-sm text-gray-500">Signature</span>
              <Link
                href={`https://explorer.solana.com/tx/${tx.txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs font-mono text-purple-600 hover:text-purple-800 break-all"
              >
                {tx.txSignature}
              </Link>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
