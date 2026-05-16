'use client'

import { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { Program, AnchorProvider, setProvider, BN } from '@coral-xyz/anchor'
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Button } from '@/components/ui/button'
import idl from '@/app/lib/idl.json'

const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!)

interface ExecuteTransferProps {
  transactionId: string
  teamName: string
  treasuryPda: string
  recipientWallet: string
  amountSol: number
  onSuccess: () => void
}

export function ExecuteTransfer({
  transactionId,
  teamName,
  treasuryPda,
  recipientWallet,
  amountSol,
  onSuccess
}: ExecuteTransferProps) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleExecute() {
    if (!wallet.publicKey) return
    setLoading(true)
    setError('')

    try {
      // Step 1: Anchor setup
      const provider = new AnchorProvider(connection, wallet as any, {
        commitment: 'confirmed'
      })
      setProvider(provider)
      const program = new Program(idl as any, provider)

      // Step 2: execute_transfer on-chain
      const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL)

      const txSignature = await program.methods
        .executeTransfer(teamName, new BN(lamports))
        .accounts({
          admin: wallet.publicKey,
          treasury: new PublicKey(treasuryPda),
          recipient: new PublicKey(recipientWallet),
          systemProgram: SystemProgram.programId
        })
        .rpc()

      console.log('Transfer signature:', txSignature)

      // Step 3: DB mein CONFIRMED + txSignature save karo
      await fetch(`/api/transactions/${transactionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CONFIRMED',
          txSignature
        })
      })

      onSuccess()

    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Something went wrong')

      // On-chain fail hua — FAILED mark karo DB mein
      await fetch(`/api/transactions/${transactionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'FAILED' })
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        size="sm"
        onClick={handleExecute}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 text-white h-7 text-xs"
      >
        {loading ? 'Sending...' : 'Approve & Send'}
      </Button>
      {error && (
        <p className="text-xs text-red-500 max-w-xs">{error}</p>
      )}
    </div>
  )
}