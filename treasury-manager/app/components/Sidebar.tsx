'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Bot,
  ArrowLeftRight,
  LogOut,
  Moon,
  Sun,
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
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const walletDisplay = publicKey
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    : null

  const initials = publicKey
    ? publicKey.toString().slice(0, 2).toUpperCase()
    : '??'

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 flex flex-col z-40
      bg-white/90 dark:bg-[#0e0e18]/90 backdrop-blur-sm
      border-r border-gray-100 dark:border-white/[0.05]
    ">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 dark:border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg solace-gradient-bg flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <span className="text-lg font-semibold solace-gradient-text">Solace</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-purple-600 dark:hover:text-purple-400'
              )}
            >
              <Icon
                size={17}
                className={active ? 'text-purple-600 dark:text-purple-400' : 'opacity-70'}
              />
              {label}

              {/* Active indicator */}
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: Wallet + Controls */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-white/[0.05] space-y-3">
        {/* Wallet info */}
        <div className="flex items-center gap-2.5 px-2">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
              My Wallet
            </p>
            {walletDisplay && (
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono truncate">
                {walletDisplay}
              </p>
            )}
          </div>
        </div>

        {/* Theme toggle + Disconnect row */}
        <div className="flex items-center gap-1.5 px-1">
          {/* Dark mode toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          )}

          {/* Disconnect */}
          <button
            onClick={disconnect}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-150"
          >
            <LogOut size={14} />
            <span>Disconnect</span>
          </button>
        </div>
      </div>
    </aside>
  )
}