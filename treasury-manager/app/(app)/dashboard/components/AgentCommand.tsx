'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Send, Sparkles } from 'lucide-react'

interface AgentCommandProps {
  adminWallet: string
  onTransactionSaved: () => void
}

const quickCommands = [
  'Pay @contributor $20 for fixing a bug',
  'Who are the top contributors?',
  'Show recent transactions',
]

export function AgentCommand({ adminWallet, onTransactionSaved }: AgentCommandProps) {
  const [command, setCommand] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSend() {
    if (!command.trim()) return
    setLoading(true)
    setResponse('')

    try {
      const res = await fetch('/api/agent/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, adminWallet })
      })
      const data = await res.json()
      setResponse(data.message ?? data.error)
      if (res.ok) onTransactionSaved()
    } catch {
      setResponse('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] card-shadow overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.05] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-sm">
          <Sparkles size={15} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Agent Command</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500">Natural language payments &amp; queries</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Quick command chips */}
        <div className="flex flex-wrap gap-2">
          {quickCommands.map((cmd) => (
            <button
              key={cmd}
              onClick={() => setCommand(cmd)}
              className="text-xs px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-800/50 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/40 hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="relative">
          <Textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder='e.g. "Pay @rahul $50 for fixing the login bug"'
            className="min-h-[90px] resize-none border-gray-200 dark:border-white/[0.08] bg-gray-50/50 dark:bg-white/[0.02] focus-visible:ring-purple-400 focus-visible:border-purple-400 text-sm pr-12 rounded-xl"
            rows={3}
          />
          <button
            onClick={handleSend}
            disabled={loading || !command.trim()}
            className="absolute right-3 bottom-3 w-8 h-8 rounded-lg solace-gradient-bg flex items-center justify-center shadow-sm hover:brightness-110 hover:scale-105 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
            Processing command...
          </div>
        )}

        {/* Agent Response */}
        {response && !loading && (
          <div className="rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800/40 p-4">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles size={10} className="text-white" />
              </div>
              <p className="text-sm text-purple-900 dark:text-purple-200 leading-relaxed">{response}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}