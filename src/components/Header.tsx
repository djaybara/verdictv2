'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs'
import LangButton from './LangButton'
import { dict } from '../lib/i18n-common'

export default function Header(){
  const sp = useSearchParams()
  const [mounted, setMounted] = useState(false)
  useEffect(()=>setMounted(true), [])
  const tab = mounted ? (sp.get('tab') || 'top') : 'top'
  const lang = (typeof document !== 'undefined' ? document.documentElement.lang : 'en') as keyof typeof dict
  const d = dict[lang] || dict.en

  const tabs = [
    { key:'top', label:d.top },
    { key:'controversial', label:d.controversial },
    { key:'trending', label:d.trending },
  ]

  return (
    <header className="sticky top-0 z-20 bg-white/70 dark:bg-neutral-950/70 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-5xl mx-auto p-3 flex items-center gap-3">
        <Link href="/" className="font-semibold text-lg">QuickVerdict.com</Link>

        <nav className="ml-4 flex items-center gap-2">
          {tabs.map(t=>{
            const active = tab===t.key
            return (
              <Link
                key={t.key}
                href={`/?tab=${t.key}`}
                className={`px-3 py-1.5 rounded-full text-sm border transition
                  ${active
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white'
                    : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
              >
                {t.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/ask"
            className="px-3 py-1.5 rounded-full text-sm border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {d.ask}
          </Link>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-3 py-1.5 rounded-full text-sm border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                {d.signin}
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>

          <LangButton />
        </div>
      </div>
    </header>
  )
}
