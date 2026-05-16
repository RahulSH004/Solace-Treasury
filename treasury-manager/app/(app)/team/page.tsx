'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useSession, signIn } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import { CreateTeamForm } from './components/CreateTeamForm'
import { TeamInfo } from './components/TeamInfo'
import { MembersList } from './components/MembersList'

export default function TeamPage() {
  const { publicKey } = useWallet()
  const { data: session } = useSession()
  const adminWallet = publicKey?.toString() ?? ''

  const [team, setTeam] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!adminWallet) return
    try {
      const teamRes = await fetch(`/api/teams?adminWallet=${adminWallet}`)

      if (teamRes.ok) {
        const teamData = await teamRes.json()
        setTeam(teamData)

        const membersRes = await fetch(`/api/members?adminWallet=${adminWallet}`)
        if (membersRes.ok) {
          const data = await membersRes.json()
          setMembers(data.members)
        }
      } else {
        setTeam(null)
      }
    } finally {
      setLoading(false)
    }
  }, [adminWallet])

  useEffect(() => { fetchData() }, [fetchData])

  // Auto-save GitHub OAuth token to DB when user connects GitHub.
  // This fires whenever session.accessToken becomes available and the team
  // doesn't already have a stored token — so the user never needs to enter
  // a PAT manually after connecting via OAuth.
  useEffect(() => {
    if (!adminWallet || !team || !session?.accessToken) return
    if (team.githubConnected) return // Already saved, skip

    fetch('/api/teams', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminWallet })
    })
      .then(res => {
        if (res.ok) fetchData() // Refresh so githubConnected flips to true
      })
      .catch(() => {}) // Fail silently — user can still use PAT fallback
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, team?.githubConnected, adminWallet])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-purple-600">Loading...</p>
    </div>
  )

  if (!team) return (
    <CreateTeamForm
      adminWallet={adminWallet}
      onTeamCreated={fetchData}
    />
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        {!session?.accessToken ? (
          <button
            onClick={() => signIn('github')}
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Connect GitHub
          </button>
        ) : (
          <p className="text-xs text-green-600 font-medium">✓ GitHub Connected</p>
        )}
      </div>

      <TeamInfo
        repoOwner={team.repoOwner}
        repoName={team.repoName}
        treasuryPda={team.treasuryPda}
        adminWallet={adminWallet}
        githubConnected={!!team.githubConnected}
        onInitialized={(pda) => {
          setTeam((prev: any) => ({ ...prev, treasuryPda: pda }))
        }}
        onTokenSaved={fetchData}
      />
      <MembersList
        members={members}
        teamId={team.id}
        onMemberAdded={fetchData}
      />
    </div>
  )
}
