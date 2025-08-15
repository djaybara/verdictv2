'use client'
import { useEffect, useState } from 'react'

const LOCALES = ['en','fr','es','de'] as const
type Locale = typeof LOCALES[number]

function detect(): Locale {
  if (typeof window === 'undefined') return 'en'
  const saved = localStorage.getItem('lang')
  if (saved && (LOCALES as readonly string[]).includes(saved as Locale)) return saved as Locale
  const nav = navigator.language?.slice(0,2).toLowerCase() as Locale
  return (LOCALES as readonly string[]).includes(nav) ? nav : 'en'
}

export default function LanguageButton(){
  const [lang, setLang] = useState<Locale>('en')
  useEffect(() => { setLang(detect()) }, [])
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  function cycle(){
    const idx = LOCALES.indexOf(lang)
    const next = LOCALES[(idx + 1) % LOCALES.length]
    localStorage.setItem('lang', next)
    setLang(next)
  }
  return (
    <button onClick={cycle} className="h-9 min-w-[2.25rem] px-2 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium" title="Language">
      {lang.toUpperCase()}
    </button>
  )
}
