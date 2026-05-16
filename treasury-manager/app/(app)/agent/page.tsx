'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useState, useRef, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Send, Sparkles } from 'lucide-react'
import { ChatBubble, TypingIndicator } from './components/ChatBubble'
import { SuggestionChips } from './components/SuggestionChips'

interface Message {
  role: 'user' | 'agent'
  content: string
}

const suggestions = [
  'Pay @RahulSH004 $10 for fixing the login bug',
  'Who are the top contributors this week?',
  'What is the current SOL price in USD?',
  'Pay the highest contributor $20',
  'Show recent pull requests',
]

export default function AgentPage() {
  const { publicKey } = useWallet()
  const adminWallet = publicKey?.toString() ?? ''

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'agent',
      content: 'Hi! I am Solace. Tell me what you need — pay a contributor, check GitHub PRs, or anything else.'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend() {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('/api/agent/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: userMessage, adminWallet })
      })
      const data = await res.json()
      setMessages(prev => [
        ...prev,
        { role: 'agent', content: data.message ?? data.error ?? 'Something went wrong.' }
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'agent', content: 'Something went wrong. Try again.' }
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-md shadow-purple-500/20">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Agent
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Natural language treasury commands
          </p>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4 pb-4 pr-1">
        {messages.map((msg, i) => (
          <ChatBubble key={i} role={msg.role} content={msg.content} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Bottom input area */}
      <div className="flex-shrink-0 pt-4 space-y-3 border-t border-gray-100 dark:border-white/[0.05]">
        {/* Suggestion chips */}
        <SuggestionChips suggestions={suggestions} onSelect={setInput} />

        {/* Input row */}
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command... (Enter to send, Shift+Enter for newline)"
              className="resize-none border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] focus-visible:ring-purple-400 focus-visible:border-purple-400 text-sm rounded-xl min-h-[56px] pr-4"
              rows={2}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="flex-shrink-0 w-11 h-11 rounded-xl solace-gradient-bg flex items-center justify-center shadow-md shadow-purple-500/20 hover:brightness-110 hover:scale-105 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}