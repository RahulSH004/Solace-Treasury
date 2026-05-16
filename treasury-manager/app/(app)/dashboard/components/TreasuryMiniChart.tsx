'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface Tx {
  amountSol: number
  status: string
  createdAt: string
}

interface TreasuryMiniChartProps {
  transactions: Tx[]
  currentBalance: number
}

function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export function TreasuryMiniChart({ transactions, currentBalance }: TreasuryMiniChartProps) {
  const { points, inflow, outflow, hasActivity } = useMemo(() => {
    const days = getLast7Days()

    // Only count confirmed/approved outflows
    const confirmedTxs = transactions.filter(
      (tx) => tx.status === 'CONFIRMED' || tx.status === 'APPROVED'
    )

    // Sum outflows per day
    const outflowByDay: Record<string, number> = {}
    for (const tx of confirmedTxs) {
      const day = tx.createdAt.slice(0, 10)
      outflowByDay[day] = (outflowByDay[day] ?? 0) + tx.amountSol
    }

    // Build cumulative balance from the past backwards
    // Start from current balance and work backwards
    let runningBalance = currentBalance
    const dailyBalances: number[] = []

    // Process from oldest to newest
    for (let i = days.length - 1; i >= 0; i--) {
      dailyBalances[i] = runningBalance
      // Going backwards: add back what was spent that day
      runningBalance += outflowByDay[days[i]] ?? 0
    }

    // Total 7-day inflow/outflow
    const totalOut = confirmedTxs
      .filter((tx) => days.includes(tx.createdAt.slice(0, 10)))
      .reduce((s, tx) => s + tx.amountSol, 0)

    const hasActivity = totalOut > 0 || transactions.length > 0

    return {
      points: dailyBalances,
      inflow: 0, // no inflow tracking yet
      outflow: totalOut,
      hasActivity,
    }
  }, [transactions, currentBalance])

  // SVG dimensions
  const W = 280
  const H = 64
  const PAD = 4

  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 0.001

  const toX = (i: number) => PAD + (i / (points.length - 1)) * (W - PAD * 2)
  const toY = (v: number) => H - PAD - ((v - min) / range) * (H - PAD * 2)

  const pathD = points
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`)
    .join(' ')

  // Area fill path (closed)
  const areaD =
    pathD +
    ` L ${toX(points.length - 1).toFixed(1)} ${H} L ${toX(0).toFixed(1)} ${H} Z`

  const trendUp = points[points.length - 1] >= points[0]

  return (
    <div className="mt-4">
      {/* Chart */}
      <div className="relative">
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          className="overflow-visible"
          aria-label="7-day treasury balance chart"
        >
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaD} fill="url(#chartGrad)" />

          {/* Line */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="#a855f7"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' as const }}
          />

          {/* End dot */}
          <circle
            cx={toX(points.length - 1)}
            cy={toY(points[points.length - 1])}
            r="3"
            fill="#a855f7"
            className="drop-shadow-sm"
          />
        </svg>
      </div>

      {/* Day labels + stats row */}
      <div className="flex items-center justify-between mt-1.5">
        <div className="flex gap-[1px] text-[9px] text-gray-400 dark:text-gray-600 font-mono w-full justify-between">
          {['7d', '6d', '5d', '4d', '3d', '2d', '1d'].map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>

      {/* Mini stats */}
      <div className="flex items-center gap-4 mt-2.5">
        {outflow > 0 && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400/80" />
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              −{outflow.toFixed(3)} SOL out
            </span>
          </div>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <span
            className={`text-[10px] font-medium ${
              trendUp
                ? 'text-green-500 dark:text-green-400'
                : 'text-red-400 dark:text-red-400'
            }`}
          >
            {trendUp ? '▲' : '▼'} 7-day trend
          </span>
        </div>
      </div>
    </div>
  )
}
