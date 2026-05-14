'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface AgentCommandProps {
  adminWallet: string
  onTransactionSaved: () => void  // parent ko refresh karne ke liye
}

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

      // Transaction save hua hoga — parent refresh kare
      if (res.ok) onTransactionSaved()

    } catch (err) {
      setResponse('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-purple-100">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">
          Agent Command
        </CardTitle>
        <p className="text-sm text-gray-400">
          e.g. "Pay @rahul $50 for fixing the login bug"
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Type a command..."
          className="border-purple-100 focus-visible:ring-purple-400 resize-none"
          rows={3}
        />
        <Button
          onClick={handleSend}
          disabled={loading || !command.trim()}
          className="bg-purple-600 hover:bg-purple-700 text-white w-full"
        >
          {loading ? 'Processing...' : 'Send'}
        </Button>

        {/* Agent Response */}
        {response && (
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
            <p className="text-sm text-purple-800">{response}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}