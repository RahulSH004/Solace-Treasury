'use client'

import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { ConnectWalletButton } from '../connect_button'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

const stagger = {
  show: {
    transition: { staggerChildren: 0.12 },
  },
}

const chatMessages = [
  { role: 'user', text: 'Pay @rahul $50 for fixing the login bug' },
  { role: 'agent', text: '✓ Transaction saved, pending your approval.' },
  { role: 'user', text: 'Who are top contributors this week?' },
  { role: 'agent', text: '🔍 Fetching GitHub PRs from your repo...' },
]

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/8 dark:bg-violet-500/12 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Text content */}
        <motion.div
          className="space-y-8 text-center lg:text-left"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* Badge */}
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/50 text-purple-700 dark:text-purple-300 text-sm px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse-dot" />
              Powered by Solana Devnet
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900 dark:text-white leading-[1.08]"
          >
            The AI Treasury Manager{' '}
            <span className="solace-gradient-text">Your Team Deserves</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            className="text-xl text-gray-500 dark:text-gray-400 max-w-md leading-relaxed"
          >
            Pay contributors, track funds, and manage your Solana team wallet —{' '}
            all with natural language.
          </motion.p>

          {/* CTA row */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <div className="scale-100 hover:scale-[1.02] transition-transform duration-150">
              <ConnectWalletButton />
            </div>
            <button
              onClick={() => {
                document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 border border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-150"
            >
              See how it works
              <ArrowRight size={16} />
            </button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-6 justify-center lg:justify-start text-sm text-gray-400 dark:text-gray-500"
          >
            {['On-chain security', 'AI-powered', 'Open source'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-purple-500" />
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: Floating chat card */}
        <motion.div
          className="flex justify-center lg:justify-end"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
        >
          <div className="relative">
            {/* Glow behind card */}
            <div className="absolute inset-0 -m-6 bg-purple-500/20 rounded-3xl blur-2xl pointer-events-none" />

            {/* Floating card */}
            <div className="relative animate-float w-80 rounded-2xl glass-purple border border-purple-200/50 dark:border-purple-800/30 overflow-hidden shadow-xl dark:shadow-purple-900/20">
              {/* Card header */}
              <div className="px-4 py-3 border-b border-purple-100/50 dark:border-purple-800/30 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Solace AI Agent
                </span>
              </div>

              {/* Chat messages */}
              <div className="p-4 space-y-3 bg-white/60 dark:bg-black/20">
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.2 }}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'solace-gradient-bg text-white rounded-br-sm'
                          : 'bg-white dark:bg-white/10 border border-purple-100 dark:border-white/10 text-gray-700 dark:text-gray-200 rounded-bl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input bar */}
              <div className="px-4 py-3 border-t border-purple-100/50 dark:border-purple-800/30 bg-white/40 dark:bg-black/10">
                <div className="flex items-center gap-2 bg-white dark:bg-white/5 rounded-lg px-3 py-2 border border-purple-100 dark:border-white/10">
                  <span className="text-xs text-gray-400 flex-1">Type a command...</span>
                  <div className="w-5 h-5 rounded-md solace-gradient-bg flex items-center justify-center">
                    <ArrowRight size={10} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
