'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface AddMemberDialogProps {
  teamId: string
  onMemberAdded: () => void
}

export function AddMemberDialog({ teamId, onMemberAdded }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [githubUsername, setGithubUsername] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAdd() {
    if (!githubUsername.trim() || !walletAddress.trim()) {
      setError('Both fields are required')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, githubUsername, walletAddress })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }

      setOpen(false)
      setGithubUsername('')
      setWalletAddress('')
      onMemberAdded()
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              GitHub Username
            </label>
            <Input
              placeholder="e.g. RahulSH004"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              className="border-purple-100 focus-visible:ring-purple-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Solana Wallet Address
            </label>
            <Input
              placeholder="e.g. Ek1NQn...tCQm"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="border-purple-100 focus-visible:ring-purple-400"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            onClick={handleAdd}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? 'Adding...' : 'Add Member'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}