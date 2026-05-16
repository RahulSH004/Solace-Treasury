import { PublicKey } from '@solana/web3.js'

export function parseSolanaAddress(input: unknown): string {
  const s = typeof input === 'string' ? input.trim() : ''
  if (!s) throw new Error('Wallet address is empty')
  try {
    new PublicKey(s)
  } catch {
    throw new Error('Invalid Solana wallet address')
  }
  return s
}