'use client'
import { useEffect, useState } from 'react'

const ORDER = ['en','fr','es','de'] as const
type Lang = typeof ORDER[number]

function nextLang(cur:Lang):Lang{
  const i = ORDER.indexOf(cur)
  return ORDER[(i+1)%ORDER.length]
}

export default function LangButton(){
  const [lang, setLang] = useState<Lang>('en')

  useEffect(()=>{
    const cur = (document.documentElement.lang || 'en') as Lang
    setLang(ORDER.includes(cur) ? cur : 'en')
  },[])

  function setCookie(name:string, value:string, days=365){
    const d = new Date(); d.setTime(d.getTime()+days*24*60*60*1000)
    document.cookie = `${name}=${value}; expires=${d.toUTCString()}; path=/`
  }

  function cycle(){
    const nx = nextLang(lang)
    setCookie('qlang', nx)
    document.documentElement.lang = nx
    window.location.reload()
  }

  const label = lang.toUpperCase()
  return (
    <button onClick={cycle} className="px-2 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800">
      {label}
    </button>
  )
}
