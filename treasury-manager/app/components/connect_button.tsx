'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export function ConnectWalletButton() {
  const { wallet, connect, connected, publicKey, disconnect } = useWallet()
  const { setVisible } = useWalletModal()

  useEffect(() => {
    if (wallet && !connected) {
      connect().catch(() => {})
    }
  }, [wallet])

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-purple-600 font-mono">
          {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={disconnect}
          className="border-purple-200 text-purple-600 hover:bg-purple-50"
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={() => setVisible(true)}
      className="bg-purple-600 hover:bg-purple-700 text-white"
    >
      Connect Wallet
    </Button>
  )
}