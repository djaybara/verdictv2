'use client'
import { useState } from 'react'

export default function OpinionColumn({
  side, label, qid, items
}:{ side:'for'|'against', label:string, qid:string, items:any[] }){
  const [val, setVal] = useState('')
  const [busy, setBusy] = useState(false)

  async function addOpinion(text:string){
    if(!text.trim()) return
    setBusy(true)
    await fetch('/api/opinions', {
      method:'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({ questionId: qid, side, text })
    })
    location.reload()
  }

  async function upOpinion(id:string){
    setBusy(true)
    await fetch('/api/opinion-up', {
      method:'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({ opinionId: id })
    })
    location.reload()
  }

  async function replyOpinion(id:string, text:string){
    if(!text.trim()) return
    setBusy(true)
    await fetch('/api/replies', {
      method:'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({ opinionId: id, text })
    })
    location.reload()
  }

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3">
      <div className={`font-semibold mb-2 ${side==='for' ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{label}</div>
      <div className="grid gap-2">
        {items.length===0 && <div className="text-sm text-neutral-500">No arguments yet.</div>}
        {items.map((o:any) => (
          <div key={o.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2">
            <div className="flex items-start gap-2">
              <button
                onClick={()=>upOpinion(o.id)}
                disabled={busy}
                className={`px-2 py-1 text-xs rounded border ${side==='for'?'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/40':'hover:bg-rose-50 dark:hover:bg-rose-900/20 border-rose-200 dark:border-rose-900/40'}`}
                aria-label="+1 this opinion"
              >+{o.up || 0}</button>
              <div className="text-sm flex-1">{o.text}</div>
            </div>
            <div className="mt-2 pl-6 border-l border-neutral-200 dark:border-neutral-800">
              {(o.replies||[]).slice(0,5).map((r:any) => (
                <div key={r.id} className="text-sm py-1 flex items-start gap-2">
                  <span className="text-neutral-400">↳</span>
                  <span className="flex-1">{r.text}</span>
                </div>
              ))}
              <ReplyBox disabled={busy} onSend={(txt)=>replyOpinion(o.id, txt)} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={val}
          onChange={e=>setVal(e.target.value)}
          placeholder={side==='for'?'Add a FOR argument':'Add an AGAINST argument'}
          className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
        />
        <button
          onClick={()=>addOpinion(val)}
          disabled={busy}
          className={`rounded-lg px-3 py-2 text-sm text-white ${side==='for'?'bg-emerald-600':'bg-rose-600'}`}
        >Post</button>
      </div>
    </div>
  )
}

function ReplyBox({ onSend, disabled }:{ onSend:(text:string)=>void, disabled?:boolean }){
  const [open, setOpen] = useState(false)
  const [val, setVal] = useState('')
  if(!open) return <button className="text-xs px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={()=>setOpen(true)}>Reply</button>
  return (
    <div className="mt-2 flex items-center gap-2">
      <input value={val} onChange={e=>setVal(e.target.value)} placeholder="Write a reply…" className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs" />
      <button disabled={disabled} className="text-xs px-2 py-1 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" onClick={()=>{ if(!val.trim()) return; onSend(val.trim()); setVal(''); setOpen(false) }}>Post</button>
      <button className="text-xs px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={()=>setOpen(false)}>Cancel</button>
    </div>
  )
}
