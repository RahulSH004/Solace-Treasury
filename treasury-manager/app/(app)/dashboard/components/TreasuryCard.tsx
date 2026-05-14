'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TreasuryCardProps {
  repoOwner: string
  repoName: string
  treasuryPda: string | null
  solBalance: number | null
}

export function TreasuryCard({
  repoOwner,
  repoName,
  treasuryPda,
  solBalance
}: TreasuryCardProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Balance Card */}
      <Card className="border-purple-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Treasury Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {solBalance !== null ? `${solBalance} SOL` : '—'}
          </div>
          <p className="text-xs text-gray-400 mt-1 font-mono truncate">
            {treasuryPda ?? 'Not initialized'}
          </p>
        </CardContent>
      </Card>

      {/* Repo Card */}
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