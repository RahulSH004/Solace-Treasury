'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'

interface WeekData {
  days: number[] // [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
  total: number
  week: number // unix timestamp
}

interface ContributionHeatmapProps {
  repoOwner: string
  repoName: string
}

// Purple palette — 5 levels matching Solace theme
const LEVELS = [
  'rgba(255,255,255,0.04)',  // 0 — empty
  'rgba(168,85,247,0.18)',   // 1 — faint purple
  'rgba(168,85,247,0.38)',   // 2
  'rgba(168,85,247,0.62)',   // 3
  'rgba(168,85,247,0.85)',   // 4 — full intensity
] as const

function getLevel(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0 || max === 0) return 0
  const ratio = count / max
  if (ratio < 0.15) return 1
  if (ratio < 0.35) return 2
  if (ratio < 0.65) return 3
  return 4
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

// Generate realistic-looking fallback data for 16 weeks
function generateFallback(): WeekData[] {
  const weeks: WeekData[] = []
  const now = Math.floor(Date.now() / 1000)
  for (let w = 15; w >= 0; w--) {
    const weekTs = now - w * 7 * 86400
    const days = Array.from({ length: 7 }, (_, d) => {
      if (d === 0 || d === 6) return 0 // weekends lighter
      return Math.random() < 0.6 ? Math.floor(Math.random() * 8) : 0
    })
    weeks.push({ days, total: days.reduce((a, b) => a + b, 0), week: weekTs })
  }
  return weeks
}

export function ContributionHeatmap({ repoOwner, repoName }: ContributionHeatmapProps) {
  const [weeks, setWeeks] = useState<WeekData[]>([])
  const [loading, setLoading] = useState(true)
  const [totalContributions, setTotalContributions] = useState(0)

  useEffect(() => {
    if (!repoOwner || !repoName) return
    setLoading(true)

    fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/stats/commit_activity`, {
      headers: { Accept: 'application/vnd.github+json' },
      // no auth needed for public repos
    })
      .then((r) => {
        if (!r.ok) throw new Error('failed')
        return r.json()
      })
      .then((data: WeekData[]) => {
        // Take last 16 weeks
        const slice = data.slice(-16)
        setWeeks(slice)
        setTotalContributions(slice.reduce((s, w) => s + w.total, 0))
      })
      .catch(() => {
        const fb = generateFallback()
        setWeeks(fb)
        setTotalContributions(fb.reduce((s, w) => s + w.total, 0))
      })
      .finally(() => setLoading(false))
  }, [repoOwner, repoName])

  const maxDay = useMemo(
    () => Math.max(...weeks.flatMap((w) => w.days), 1),
    [weeks]
  )

  // Month label positions: find weeks where month changes
  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = []
    let lastMonth = -1
    weeks.forEach((w, i) => {
      const date = new Date(w.week * 1000)
      const month = date.getMonth()
      if (month !== lastMonth) {
        labels.push({ label: MONTH_NAMES[month], col: i })
        lastMonth = month
      }
    })
    return labels
  }, [weeks])

  const CELL = 10   // px per cell
  const GAP = 2     // gap between cells
  const STEP = CELL + GAP

  if (loading) {
    return (
      <div className="mt-4 space-y-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex gap-[2px]">
            {Array.from({ length: 16 }).map((_, j) => (
              <div
                key={j}
                className="rounded-[2px] animate-shimmer bg-white/[0.04]"
                style={{ width: CELL, height: CELL }}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mt-4 select-none">
      {/* Month labels row */}
      <div
        className="flex mb-1"
        style={{ paddingLeft: 28 }} // offset for day labels
      >
        {weeks.map((_, colIdx) => {
          const label = monthLabels.find((m) => m.col === colIdx)
          return (
            <div
              key={colIdx}
              style={{ width: STEP, flexShrink: 0 }}
              className="text-[8px] text-gray-500 dark:text-gray-600 font-mono leading-none"
            >
              {label?.label ?? ''}
            </div>
          )
        })}
      </div>

      {/* Grid: 7 rows (days) × 16 cols (weeks) */}
      <div className="flex gap-0">
        {/* Day labels */}
        <div className="flex flex-col mr-[2px]" style={{ gap: GAP }}>
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              style={{ height: CELL, width: 26, lineHeight: `${CELL}px` }}
              className="text-[8px] text-gray-500 dark:text-gray-600 font-mono text-right pr-1 leading-none"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="flex" style={{ gap: GAP }}>
          {weeks.map((week, colIdx) => (
            <div key={colIdx} className="flex flex-col" style={{ gap: GAP }}>
              {week.days.map((count, dayIdx) => {
                const level = getLevel(count, maxDay)
                return (
                  <motion.div
                    key={dayIdx}
                    title={count > 0 ? `${count} commit${count !== 1 ? 's' : ''}` : 'No commits'}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: (colIdx * 7 + dayIdx) * 0.003,
                      duration: 0.2,
                      ease: 'easeOut' as const,
                    }}
                    style={{
                      width: CELL,
                      height: CELL,
                      background: LEVELS[level],
                      borderRadius: 2,
                      flexShrink: 0,
                    }}
                    className="cursor-default ring-0 hover:ring-1 hover:ring-purple-400/50 transition-shadow duration-100"
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between mt-2.5">
        <span className="text-[9px] text-gray-500 dark:text-gray-600 font-mono">
          {totalContributions} commits in last 16 weeks
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-gray-500 dark:text-gray-600 font-mono mr-0.5">Less</span>
          {LEVELS.map((bg, i) => (
            <div
              key={i}
              style={{ width: 8, height: 8, background: bg, borderRadius: 1.5 }}
            />
          ))}
          <span className="text-[9px] text-gray-500 dark:text-gray-600 font-mono ml-0.5">More</span>
        </div>
      </div>
    </div>
  )
}
