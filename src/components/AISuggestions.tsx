
'use client'
import { useMemo, useState } from 'react'

const ANGLE_LIBRARY = [
  { key: 'cost', for: 'Affordable compared to alternatives', against: 'Total cost over time (device + maintenance)' },
  { key: 'evidence', for: 'Backed by clinical studies', against: 'Lack of robust long‑term studies' },
  { key: 'safety', for: 'Generally safe when used correctly', against: 'Possible side effects or misuse risks' },
  { key: 'time', for: 'Time‑efficient routine', against: 'Results take too long for most' },
  { key: 'usability', for: 'Easy to use at home', against: 'Inconvenient or uncomfortable to wear' },
  { key: 'alternatives', for: 'Better than salon/clinic visits', against: 'Cheaper or better alternatives exist' },
  { key: 'evidence2', for: 'Visible results shared by many users', against: 'Placebo or biased testimonials' },
  { key: 'environment', for: 'Low environmental footprint', against: 'E‑waste and energy consumption' },
]

function extractKeywords(text: string){
  const stop = new Set(['the','a','an','and','or','to','for','of','in','on','is','are','it','with','you','your','too','very','more','most','less','few','at','by','from','vs','than','that','this'])
  return text.toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(w => w && !stop.has(w) && w.length>2)
}

export default function AISuggestions({ questionId, allOpinionText, onAdd }:{ questionId:string, allOpinionText:string, onAdd:(side:'for'|'against', text:string)=>void }){
  const [seed, setSeed] = useState(0)
  const kws = useMemo(() => new Set(extractKeywords(allOpinionText)), [allOpinionText])
  const missing = ANGLE_LIBRARY.filter(a => {
    const tokens = extractKeywords(`${a.for} ${a.against}`)
    return !tokens.some(tk => kws.has(tk))
  })
  const shown = useMemo(() => missing.slice(0,3), [missing, seed])
  if (shown.length===0) return null
  return (
    <div className="mt-3 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 bg-white/70 dark:bg-neutral-900/70">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">AI suggestions — Fresh angles not covered</div>
        <button onClick={()=>setSeed(s=>s+1)} className="text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800">Shuffle</button>
      </div>
      <div className="grid sm:grid-cols-3 gap-2">
        {shown.map(a => (
          <div key={a.key} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-2 bg-gradient-to-br from-emerald-50/60 to-white dark:from-emerald-900/20 dark:to-neutral-900">
            <div className="text-sm font-medium mb-1 flex items-center gap-1"><span>💡</span><span className="capitalize">{a.key}</span></div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-2 line-clamp-2">{a.for}</div>
            <div className="flex items-center gap-1">
              <button className="text-[11px] px-2 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" onClick={()=>onAdd('for', a.for)}>➕ Add FOR</button>
              <button className="text-[11px] px-2 py-1 rounded-full border border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20" onClick={()=>onAdd('against', a.against)}>➕ Add AGAINST</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
