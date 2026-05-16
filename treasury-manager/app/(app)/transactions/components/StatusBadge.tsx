'use client'

type Status = 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'FAILED'

interface StatusBadgeProps {
  status: Status
}

const config: Record<Status, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800/50',
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50',
  },
  CONFIRMED: {
    label: 'Confirmed',
    className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/50',
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/50',
  },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = config[status]
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
    >
      {label}
    </span>
  )
}
