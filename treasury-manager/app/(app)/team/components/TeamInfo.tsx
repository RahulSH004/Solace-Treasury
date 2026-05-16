'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, Check } from 'lucide-react'
import { InitializeTreasury } from './InitializeTreasury'
import { DepositSol } from './DepositSol'

interface TeamInfoProps {
  repoOwner: string
  repoName: string
  treasuryPda: string | null
  adminWallet: string
  onInitialized: (pda: string) => void
}

export function TeamInfo({ repoOwner, repoName, treasuryPda, adminWallet, onInitialized }: TeamInfoProps) {
  const [copied, setCopied] = useState(false)

  function copyPda() {
    if (!treasuryPda) return
    navigator.clipboard.writeText(treasuryPda)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border-purple-100">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">
          Team Info
        </CardTitle>
        {treasuryPda && (
          <DepositSol
            teamName={repoName}
            treasuryPda={treasuryPda}
            onDeposited={() => onInitialized(treasuryPda)}  // balance refresh karega
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
      </CardContent>
    </Card>
  )
}