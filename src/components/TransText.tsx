'use client'
import { useEffect, useState } from 'react'

function hash(s:string){
  // djb2
  let h=5381; for (let i=0;i<s.length;i++){ h=((h<<5)+h)+s.charCodeAt(i) }
  return (h>>>0).toString(36)
}

type Props = {
  text: string
  as?: keyof JSX.IntrinsicElements
  className?: string
  showBadge?: boolean
}

export default function TransText({ text, as='div', className='', showBadge=false }:Props){
  const [t, setT] = useState<string>(text)
  const [loading, setLoading] = useState<boolean>(false)
  const Tag:any = as

  useEffect(()=>{
    const lang = (typeof document!=='undefined' ? document.documentElement.lang : 'en') || 'en'
    if (!text || lang==='en'){ setT(text); return }

    const key = `qv_t_${lang}_${hash(text)}`
    const cached = typeof window!=='undefined' ? localStorage.getItem(key) : null
    if (cached){ setT(cached); return }

    let aborted = false
    ;(async ()=>{
      try{
        setLoading(true)
        const res = await fetch('/api/ai/translate', {
          method:'POST', headers:{'content-type':'application/json'},
          body: JSON.stringify({ lang, texts: [text] })
        })
        const j = await res.json().catch(()=>null)
        const out = j?.translations?.[0] || text
        if (!aborted){
          setT(out)
          try { localStorage.setItem(key, out) } catch {}
        }
      } finally {
        if (!aborted) setLoading(false)
      }
    })()
    return ()=>{ aborted = true }
  }, [text])

  return (
    <Tag className={className} data-ai-translated={t!==text ? '1' : '0'}>
      {t}
      {showBadge && t!==text && (
        <span className="ml-2 align-middle text-[10px] px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-500">
          AI
        </span>
      )}
      {loading && (
        <span className="ml-2 text-[10px] text-neutral-400">…</span>
      )}
    </Tag>
  )
}
