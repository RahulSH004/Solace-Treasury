import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TeamInfoProps {
  repoOwner: string
  repoName: string
  treasuryPda: string | null
  adminWallet: string
}

export function TeamInfo({ repoOwner, repoName, treasuryPda, adminWallet }: TeamInfoProps) {
  return (
    <Card className="border-purple-100">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">
          Team Info
        </CardTitle>
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
          <span className="text-xs font-mono text-gray-400">
            {treasuryPda ? `${treasuryPda.slice(0, 6)}...${treasuryPda.slice(-4)}` : 'Not initialized'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}