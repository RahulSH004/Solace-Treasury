'use client'

import { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { Program, AnchorProvider, setProvider, BN } from '@coral-xyz/anchor'
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import idl from '@/app/lib/idl.json'

const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!)

interface DepositSolProps {
  teamName: string
  treasuryPda: string
  onDeposited: () => void
}

export function DepositSol({ teamName, treasuryPda, onDeposited }: DepositSolProps) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDeposit() {
    if (!wallet.publicKey || !amount) return
    setLoading(true)
    setError('')

    try {
      const provider = new AnchorProvider(connection, wallet as any, {
        commitment: 'confirmed'
      })
      setProvider(provider)

      const program = new Program(idl as any, provider)
      const lamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL)

      await program.methods
        .depositFunds(teamName, new BN(lamports))
        .accounts({
          admin: wallet.publicKey,
          treasury: new PublicKey(treasuryPda),
          systemProgram: SystemProgram.programId
        })
        .rpc()

      setOpen(false)
      setAmount('')
      onDeposited()

    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-purple-200 text-purple-600 hover:bg-purple-50"
        >
          Deposit SOL
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit SOL</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Amount (SOL)
            </label>
            <Input
              type="number"
              placeholder="e.g. 0.5"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-purple-100 focus-visible:ring-purple-400"
              min="0"
              step="0.01"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            onClick={handleDeposit}
            disabled={loading || !amount}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? 'Depositing...' : 'Deposit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}