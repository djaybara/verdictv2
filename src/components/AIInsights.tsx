'use client'
import { useEffect, useRef, useState } from 'react'
import { dict } from '../lib/i18n-common'

export default function AIInsights({ forItems, againstItems, auto = true }:{
  forItems: { text:string, up?:number }[]
  againstItems: { text:string, up?:number }[]
  auto?: boolean
}){
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<{for?:string, against?:string, missing_angles?:string[]}>({})
  const ran = useRef(false)
  const lang = (typeof document !== 'undefined' ? document.documentElement.lang : 'en') as keyof typeof dict
  const d = dict[lang] || dict.en

  async function run(){
    setLoading(true)
    setData({})
    const res = await fetch('/api/ai/summary', {
      method:'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({ forItems, againstItems })
    })
    const j = await res.json().catch(()=>({}))
    setData(j || {})
    setLoading(false)
  }

  useEffect(()=>{
    if (auto && !ran.current && (forItems?.length || againstItems?.length)){
      ran.current = true
      run()
    }
  }, [auto, forItems, againstItems])

  return (
    <div className="mt-4 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50 dark:bg-neutral-950/40">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">{d.ai_title}</span>
      </div>
      {loading && <div className="text-xs text-neutral-500">Summarizing FOR & AGAINST…</div>}
      {!loading && (data.for || data.against) && (
        <div className="grid gap-2">
          {data.for && <div><div className="text-xs text-emerald-600 dark:text-emerald-300 mb-1">{d.for_summary}</div><div className="text-sm">{data.for}</div></div>}
          {data.against && <div><div className="text-xs text-rose-600 dark:text-rose-300 mb-1">{d.against_summary}</div><div className="text-sm">{data.against}</div></div>}
          {Array.isArray(data.missing_angles) && data.missing_angles.length>0 && (
            <div>
              <div className="text-xs text-neutral-500 mb-1">{d.missing}</div>
              <ul className="list-disc pl-5 text-sm">
                {data.missing_angles.slice(0,4).map((m,i)=><li key={i}>{m}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
      {!loading && !data.for && !data.against && (
        <div className="text-xs text-neutral-500">{d.no_args}</div>
      )}
    </div>
  )
}
