'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Bot, Shield } from 'lucide-react'
import {FaGithub} from 'react-icons/fa'
const features = [
  {
    icon: Bot,
    title: 'AI Agent',
    description:
      'Natural language payments. Just say "Pay @alice $50 for the landing page design" and Solace handles the rest.',
    gradient: 'from-purple-500 to-violet-600',
    glow: 'group-hover:shadow-purple-500/20',
  },
  {
    icon: Shield,
    title: 'On-Chain Security',
    description:
      'Every transaction requires admin approval before execution. Your funds never move without your say.',
    gradient: 'from-violet-500 to-purple-700',
    glow: 'group-hover:shadow-violet-500/20',
  },
  {
    icon: FaGithub,
    title: 'GitHub Integration',
    description:
      'Auto-detect top contributors from pull requests. Reward the people actually shipping code.',
    gradient: 'from-purple-600 to-indigo-600',
    glow: 'group-hover:shadow-indigo-500/20',
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' as const },
  }),
}

export function Features() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="features" className="py-28 px-6 relative">
      {/* Subtle section bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-50/30 dark:via-purple-950/10 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto relative" ref={ref}>
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-4">
            <div className="h-px w-8 bg-purple-300 dark:bg-purple-700" />
            Features
            <div className="h-px w-8 bg-purple-300 dark:bg-purple-700" />
          </div>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Everything your team needs
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg max-w-lg mx-auto">
            One tool to manage contributor payments, on-chain security, and GitHub insights.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate={inView ? 'show' : 'hidden'}
              className="group"
            >
              <div
                className={`h-full rounded-2xl border border-gray-100 dark:border-white/8 bg-white dark:bg-white/[0.03] p-6 card-lift cursor-default transition-all duration-200 group-hover:border-purple-300 dark:group-hover:border-purple-700/50 ${feature.glow} group-hover:shadow-lg`}
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg`}
                >
                  <feature.icon size={22} className="text-white" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Bottom accent */}
                <div
                  className={`mt-6 h-0.5 w-0 group-hover:w-full bg-gradient-to-r ${feature.gradient} transition-all duration-300 rounded-full`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
