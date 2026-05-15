'use client'

import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TreasuryCardProps {
  repoOwner: string
  repoName: string
  treasuryPda: string | null
}

export function TreasuryCard({ repoOwner, repoName, treasuryPda }: TreasuryCardProps) {
  const { connection } = useConnection()
  const [solBalance, setSolBalance] = useState<number | null>(null)

  useEffect(() => {
    if (!treasuryPda) return

    async function fetchBalance() {
      try {
        const pubkey = new PublicKey(treasuryPda!)
        const lamports = await connection.getBalance(pubkey)
        setSolBalance(lamports / LAMPORTS_PER_SOL)
      } catch {
        setSolBalance(0)
      }
    }

    fetchBalance()

    // 30 seconds pe auto refresh
    const interval = setInterval(fetchBalance, 30000)
    return () => clearInterval(interval)
  }, [treasuryPda, connection])

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="border-purple-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Treasury Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {treasuryPda
              ? solBalance !== null
                ? `${solBalance.toFixed(4)} SOL`
                : 'Loading...'
              : '—'
            }
          </div>
          <p className="text-xs text-gray-400 mt-1 font-mono truncate">
            {treasuryPda ?? 'Not initialized'}
          </p>
        </CardContent>
      </Card>

      <Card className="border-purple-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            GitHub Repository
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-gray-900">
            {repoOwner}/{repoName}
          </div>
          <Badge
            variant="outline"
            className="mt-2 text-purple-600 border-purple-200 bg-purple-50"
          >
            Devnet
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}