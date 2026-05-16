'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface ChatBubbleProps {
  role: 'user' | 'agent'
  content: string
  isTyping?: boolean
}

export function ChatBubble({ role, content, isTyping = false }: ChatBubbleProps) {
  const isUser = role === 'user'

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end gap-2`}
      initial={{ opacity: 0, scale: 0.94, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      {/* Agent avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm mb-0.5">
          <Sparkles size={13} className="text-white" />
        </div>
      )}

      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'solace-gradient-bg text-white rounded-br-sm shadow-sm shadow-purple-500/20'
            : 'bg-white dark:bg-white/[0.06] border border-gray-100 dark:border-white/[0.08] text-gray-800 dark:text-gray-100 rounded-bl-sm shadow-sm'
        }`}
      >
        {isTyping ? (
          <div className="flex gap-1.5 py-0.5">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        ) : (
          content
        )}
      </div>
    </motion.div>
  )
}

export function TypingIndicator() {
  return (
    <ChatBubble role="agent" content="" isTyping />
  )
}
