'use client'

import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useEffect } from "react"

export function ConnectWalletButton() {
    const { setVisible } = useWalletModal()
    const { wallet, connect, connected } = useWallet()
  
    // Jaise hi wallet select ho — automatically connect karo
    useEffect(() => {
      if (wallet && !connected) {
        connect().catch(() => {})
      }
    }, [wallet])
  
    return (
      <button
        onClick={() => setVisible(true)}
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
      >
        Connect Wallet
      </button>
    )
}