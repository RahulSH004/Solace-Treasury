'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useCallback, useEffect, useState } from 'react'
import { CreateTeamForm } from './components/CreateTeamForm'
import { TeamInfo } from './components/TeamInfo'
import { MembersList } from './components/MembersList'

export default function TeamPage() {
  const { publicKey } = useWallet()
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

        // Team mila — members bhi fetch karo
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

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-purple-600">Loading...</p>
    </div>
  )

  // Team nahi mila — create form dikhao
  if (!team) return (
    <CreateTeamForm
      adminWallet={adminWallet}
      onTeamCreated={fetchData}
    />
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Team</h1>
      <div className="grid grid-cols-1 gap-6">
        <TeamInfo
          repoOwner={team.repoOwner}
          repoName={team.repoName}
          treasuryPda={team.treasuryPda}
          adminWallet={adminWallet}
        />
        <MembersList
          members={members}
          teamId={team.id}
          onMemberAdded={fetchData}
        />
      </div>
    </div>
  )
}