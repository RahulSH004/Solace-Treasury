'use client'

import { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { Program, AnchorProvider, setProvider } from '@coral-xyz/anchor'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { Button } from '@/components/ui/button'
import idl from '@/app/lib/idl.json'

const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!)

interface InitializeTreasuryProps {
  teamName: string
  adminWallet: string
  onInitialized: (pda: string) => void
}

export function InitializeTreasury({
  teamName,
  adminWallet,
  onInitialized
}: InitializeTreasuryProps) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleInitialize() {
    if (!wallet.publicKey || !wallet.signTransaction) return
    setLoading(true)
    setError('')

    try {
      // Step 1: Anchor provider setup
      const provider = new AnchorProvider(connection, wallet as any, {
        commitment: 'confirmed'
      })
      setProvider(provider)

      // Step 2: Program instance
      const program = new Program(idl as any, provider)

      // Step 3: PDA derive karo
      const [treasuryPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('treasury'),
          wallet.publicKey.toBuffer(),
          Buffer.from(teamName)
        ],
        PROGRAM_ID
      )

      // Step 4: create_team instruction call karo
      // Phantom popup aayega yahan
      await program.methods
        .createTeam(teamName)
        .accounts({
          admin: wallet.publicKey,
          treasury: treasuryPda,
          systemProgram: SystemProgram.programId
        })
        .rpc()

      console.log('Treasury PDA:', treasuryPda.toString())

      // Step 5: DB mein PDA save karo
      const res = await fetch('/api/teams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminWallet,
          treasuryPda: treasuryPda.toString()
        })
      })

      if (!res.ok) {
        setError('Failed to save PDA to DB')
        return
      }

      onInitialized(treasuryPda.toString())

    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleInitialize}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 text-white"
      >
        {loading ? 'Initializing...' : 'Initialize Treasury'}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}