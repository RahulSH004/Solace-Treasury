'use client'

import Link from 'next/link'
import { Code2, X, Zap } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-gray-100 dark:border-white/8 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md solace-gradient-bg flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">S</span>
              </div>
              <span className="font-semibold solace-gradient-text">Solace</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs text-center md:text-left">
              AI-powered treasury management for Solana teams.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <Code2 size={16} />
              GitHub
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <X size={16} />
              Twitter
            </Link>
          </div>

          {/* Built on Solana */}
          <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
            <Zap size={14} className="text-purple-500" />
            <span>Built on</span>
            <span className="font-semibold text-purple-600 dark:text-purple-400">Solana</span>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-white/5 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            © {new Date().getFullYear()} Solace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
