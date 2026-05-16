'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Repo {
  name: string
  owner: string
  private: boolean
  description: string | null
}

interface CreateTeamFormProps {
  adminWallet: string
  onTeamCreated: () => void
}

export function CreateTeamForm({ adminWallet, onTeamCreated }: CreateTeamFormProps) {
  const { data: session } = useSession()
  const [repos, setRepos] = useState<Repo[]>([])
  const [selected, setSelected] = useState<Repo | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState('')

  // GitHub connected hone pe repos fetch karo
  useEffect(() => {
    if (!session?.accessToken) return
    setFetching(true)

    fetch('/api/github/repos')
      .then(r => r.json())
      .then(data => setRepos(data.repos ?? []))
      .finally(() => setFetching(false))
  }, [session?.accessToken])

  async function handleCreate() {
    if (!selected) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminWallet,
          repoOwner: selected.owner,
          repoName: selected.name
        })
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
            Connect GitHub to select your repository
          </p>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* GitHub connect nahi hai */}
          {!session ? (
            <Button
              onClick={() => signIn('github')}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
            >
              Connect GitHub
            </Button>
          ) : fetching ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Fetching your repos...
            </p>
          ) : (
            <>
              {/* GitHub connected — repos list */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {repos.map((repo) => (
                  <button
                    key={`${repo.owner}/${repo.name}`}
                    onClick={() => setSelected(repo)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                      selected?.owner === repo.owner && selected?.name === repo.name
                        ? 'border-purple-400 bg-purple-50'
                        : 'border-purple-100 hover:border-purple-300'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {repo.owner}/{repo.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {repo.private ? '🔒 Private' : '🌐 Public'}
                      {repo.description && ` — ${repo.description}`}
                    </p>
                  </button>
                ))}
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                onClick={handleCreate}
                disabled={loading || !selected}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {loading ? 'Creating...' : 'Create Team'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}