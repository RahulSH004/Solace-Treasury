'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  Users,
  Bot,
  ArrowLeftRight,
  LogOut
} from 'lucide-react'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/team', label: 'Team', icon: Users },
  { href: '/agent', label: 'Agent', icon: Bot },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
]

export function Sidebar() {
  const pathname = usePathname()
  const { disconnect, publicKey } = useWallet()

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-white border-r border-purple-100 flex flex-col">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-purple-100">
        <span className="text-xl font-bold text-purple-600">Solace</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-purple-50 text-purple-600'
                : 'text-gray-500 hover:bg-purple-50 hover:text-purple-600'
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Wallet + Disconnect */}
      <div className="px-4 py-4 border-t border-purple-100">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
              {publicKey?.toString().slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="text-xs text-gray-400 font-mono truncate">
            {publicKey?.toString().slice(0, 6)}...{publicKey?.toString().slice(-4)}
          </p>
        </div>
        <button
          onClick={disconnect}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          <LogOut size={16} />
          Disconnect
        </button>
      </div>
    </aside>
  )
}