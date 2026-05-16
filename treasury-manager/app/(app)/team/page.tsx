'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useSession, signIn } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { FaGithub } from "react-icons/fa";
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
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading team...</p>
      </div>
    </div>
  )

  if (!team) return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-md shadow-purple-500/20">
          <Users size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Team</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create your team to get started.</p>
        </div>
      </div>
      <CreateTeamForm
        adminWallet={adminWallet}
        onTeamCreated={fetchData}
      />
    </div>
  )

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-md shadow-purple-500/20">
            <Users size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Team</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage members and treasury.</p>
          </div>
        </div>

        {/* GitHub connection status */}
        {!session?.accessToken ? (
          <button
            onClick={() => signIn('github')}
            className="flex items-center gap-2 text-sm bg-gray-900 dark:bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-white/15 transition-colors border border-gray-700 dark:border-white/10"
          >
            <FaGithub size={15} />
            Connect GitHub
          </button>
        ) : (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 px-3 py-1.5 rounded-lg">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            GitHub Connected
          </div>
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
