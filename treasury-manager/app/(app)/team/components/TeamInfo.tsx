'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Check } from 'lucide-react'
import { InitializeTreasury } from './InitializeTreasury'
import { DepositSol } from './DepositSol'

interface TeamInfoProps {
  repoOwner: string
  repoName: string
  treasuryPda: string | null
  adminWallet: string
  githubConnected: boolean
  onInitialized: (pda: string) => void
  onTokenSaved: () => void
}

export function TeamInfo({
  repoOwner,
  repoName,
  treasuryPda,
  adminWallet,
  githubConnected,
  onInitialized,
  onTokenSaved
}: TeamInfoProps) {
  const [copied, setCopied] = useState(false)
  const [pat, setPat] = useState('')
  const [showPatInput, setShowPatInput] = useState(!githubConnected)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function copyPda() {
    if (!treasuryPda) return
    navigator.clipboard.writeText(treasuryPda)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSavePat() {
    if (!pat.trim()) return
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/teams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminWallet,
          githubAccessToken: pat.trim()
        })
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to save token')
        return
      }

      setPat('')
      setShowPatInput(false)
      onTokenSaved()
    } catch {
      setError('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-purple-100">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
          Team Info
        </CardTitle>
        {treasuryPda && (
          <DepositSol
            teamName={repoName}
            treasuryPda={treasuryPda}
            onDeposited={() => onInitialized(treasuryPda)}
          />
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Repository</span>
          <span className="text-sm font-medium text-gray-900">
            {repoOwner}/{repoName}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Network</span>
          <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
            Devnet
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Admin Wallet</span>
          <span className="text-xs font-mono text-gray-400">
            {adminWallet.slice(0, 6)}...{adminWallet.slice(-4)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Treasury PDA</span>
          {treasuryPda ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400">
                {treasuryPda.slice(0, 6)}...{treasuryPda.slice(-4)}
              </span>
              <button
                onClick={copyPda}
                className="text-gray-400 hover:text-purple-600 transition-colors"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>
          ) : (
            <InitializeTreasury
              teamName={repoName}
              adminWallet={adminWallet}
              onInitialized={onInitialized}
            />
          )}
        </div>

        <div className="border-t border-purple-50 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">GitHub Access</span>
            {githubConnected ? (
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                Not connected
              </Badge>
            )}
          </div>

          {githubConnected && !showPatInput && (
            <button
              type="button"
              onClick={() => setShowPatInput(true)}
              className="text-xs text-purple-600 hover:underline"
            >
              Update PAT
            </button>
          )}

          {showPatInput && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400">
                Enter your GitHub Personal Access Token with{' '}
                <code className="text-purple-600">repo</code> scope.{' '}
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=Solace"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  Generate one here
                </a>
              </p>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxx"
                  value={pat}
                  onChange={(e) => setPat(e.target.value)}
                  className="border-purple-100 focus-visible:ring-purple-400 text-xs"
                />
                <Button
                  onClick={handleSavePat}
                  disabled={saving || !pat.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white shrink-0"
                  size="sm"
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
