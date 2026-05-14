import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AddMemberDialog } from './AddMemberDialog'

interface Member {
  id: string
  githubUsername: string
  walletAddress: string
  verified: boolean
}

interface MembersListProps {
  members: Member[]
  teamId: string
  onMemberAdded: () => void
}

export function MembersList({ members, teamId, onMemberAdded }: MembersListProps) {
  return (
    <Card className="border-purple-100">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-gray-900">
          Members ({members.length})
        </CardTitle>
        <AddMemberDialog teamId={teamId} onMemberAdded={onMemberAdded} />
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            No members yet. Add your first member.
          </p>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 py-2 border-b border-purple-50 last:border-0"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                    {member.githubUsername.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    @{member.githubUsername}
                  </p>
                  <p className="text-xs text-gray-400 font-mono truncate">
                    {member.walletAddress.slice(0, 6)}...{member.walletAddress.slice(-4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}