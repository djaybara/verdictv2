
'use client'
import { useEffect, useState } from 'react'
import { LOCALES, getLocale, setLocale } from '@/lib/i18n'

export default function LanguageButton(){
  const [lang, setLangState] = useState(getLocale())
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  function cycle(){
    const idx = LOCALES.indexOf(lang)
    const next = LOCALES[(idx + 1) % LOCALES.length]
    setLocale(next); setLangState(next)
  }
  return (
    <button onClick={cycle} className="h-9 min-w-[2.25rem] px-2 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium" title="Language">
      {lang.toUpperCase()}
    </button>
  )
}
