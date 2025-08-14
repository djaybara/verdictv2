'use client'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import LanguageButton from './LanguageButton'

function getInitialDark() {
  if (typeof window === 'undefined') return false
  const saved = localStorage.getItem('theme')
  if (saved === 'dark') return true
  if (saved === 'light') return false
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function Header(){
  const [isDark, setIsDark] = useState(getInitialDark())

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/80 dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link href="/" className="font-bold text-xl">QuickVerdict<span className="text-emerald-600">.com</span></Link>
        <nav className="ml-6 flex items-center gap-2">
          <Link href="/" className="px-3 py-1.5 rounded-full text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">Top</Link>
          <Link href="/?tab=controversial" className="px-3 py-1.5 rounded-full text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">Controversial</Link>
          <Link href="/?tab=trending" className="px-3 py-1.5 rounded-full text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">Trending</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <LanguageButton />
          <button
            onClick={() => setIsDark(v => !v)}
            className="h-9 w-9 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center"
            title="Toggle theme"
          >
            {isDark ? '🌙' : '☀️'}
          </button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  )
}
