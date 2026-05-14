'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface CreateTeamFormProps {
  adminWallet: string
  onTeamCreated: () => void
}

export function CreateTeamForm({ adminWallet, onTeamCreated }: CreateTeamFormProps) {
  const [repoOwner, setRepoOwner] = useState('')
  const [repoName, setRepoName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!repoOwner.trim() || !repoName.trim()) {
      setError('Both fields are required')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminWallet, repoOwner, repoName })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }
      onTeamCreated()
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md border-purple-100">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Create Your Team</CardTitle>
          <p className="text-sm text-gray-400">
            Connect your GitHub repository to get started
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              GitHub Owner
            </label>
            <Input
              placeholder="e.g. RahulSH004"
              value={repoOwner}
              onChange={(e) => setRepoOwner(e.target.value)}
              className="border-purple-100 focus-visible:ring-purple-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Repository Name
            </label>
            <Input
              placeholder="e.g. Solace"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="border-purple-100 focus-visible:ring-purple-400"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? 'Creating...' : 'Create Team'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}