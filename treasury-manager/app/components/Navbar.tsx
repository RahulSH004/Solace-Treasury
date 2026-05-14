'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectWalletButton } from './connect_button'
import { cn } from '@/lib/utils'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/members', label: 'Members' },
  { href: '/transactions', label: 'Transactions' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-purple-100 bg-white px-8 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-purple-600">
          Solace
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'text-purple-600'
                  : 'text-gray-500 hover:text-purple-600'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Wallet Button */}
        <ConnectWalletButton />
      </div>
    </nav>
  )
}