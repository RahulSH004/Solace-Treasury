'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'agent'
  content: string
}

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
  }, [messages])

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
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Agent</h1>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'flex',
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-lg px-4 py-3 rounded-2xl text-sm',
                msg.role === 'user'
                  ? 'bg-purple-600 text-white rounded-br-sm'
                  : 'bg-white border border-purple-100 text-gray-800 rounded-bl-sm'
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-purple-100 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3 pt-4 border-t border-purple-100">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command... (Enter to send)"
          className="flex-1 border-purple-100 focus-visible:ring-purple-400 resize-none"
          rows={2}
        />
        <Button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-purple-600 hover:bg-purple-700 text-white self-end"
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  )
}