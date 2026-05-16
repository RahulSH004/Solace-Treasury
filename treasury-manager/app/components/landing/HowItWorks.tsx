'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Wallet, MessageSquare, CheckCircle2 } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Wallet,
    title: 'Connect Wallet & GitHub',
    description:
      'Link your Solana wallet and GitHub account in one click. Solace syncs your team repo automatically.',
  },
  {
    number: '02',
    icon: MessageSquare,
    title: 'Type a Command to AI',
    description:
      '"Pay the top contributor $20 for this sprint." Natural language, real blockchain actions.',
  },
  {
    number: '03',
    icon: CheckCircle2,
    title: 'Approve & Send On-Chain',
    description:
      'Review the transaction, click approve, and Solace executes the transfer directly on Solana devnet.',
  },
]

export function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="how-it-works" className="py-28 px-6">
      <div className="max-w-5xl mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-4">
            <div className="h-px w-8 bg-purple-300 dark:bg-purple-700" />
            How it works
            <div className="h-px w-8 bg-purple-300 dark:bg-purple-700" />
          </div>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Simple as 1, 2, 3
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg max-w-lg mx-auto">
            From wallet connection to on-chain transfer in under a minute.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative flex flex-col md:flex-row gap-8 md:gap-0">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px border-t-2 border-dashed border-purple-200 dark:border-purple-800/60" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="flex-1 flex flex-col items-center text-center px-4"
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.5, ease: 'easeOut' }}
            >
              {/* Number badge */}
              <div className="relative z-10 mb-6">
                <div className="w-20 h-20 rounded-2xl solace-gradient-bg flex flex-col items-center justify-center shadow-lg shadow-purple-500/25">
                  <span className="text-xs font-bold text-purple-200 leading-none">{step.number}</span>
                  <step.icon size={24} className="text-white mt-1" />
                </div>
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-2xl bg-purple-500/20 blur-lg -z-10 scale-110" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                {step.description}
              </p>

              {/* Mobile connector */}
              {i < steps.length - 1 && (
                <div className="md:hidden w-px h-8 border-l-2 border-dashed border-purple-200 dark:border-purple-800/60 mt-6" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
