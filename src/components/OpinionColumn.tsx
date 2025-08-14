
'use client'
import { useState } from 'react'

export default function OpinionColumn({ side, label, qid, opinions, onUpId, onAdd, onReply }:{ side:'for'|'against', label:string, qid:string, opinions:any[], onUpId:(id:string)=>void, onAdd:(text:string)=>void, onReply:(id:string, text:string)=>void }){
  const [val, setVal] = useState('')
  return (
    <div className="bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3">
      <div className={`font-semibold mb-2 ${side==='for' ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{label}</div>
      <div className="grid gap-2">
        {opinions.length===0 && <div className="text-sm text-neutral-500 dark:text-neutral-400">No arguments yet.</div>}
        {opinions.map((o:any) => <OpinionItem key={o.id} side={side} qid={qid} opinion={o} onUpId={onUpId} onReply={onReply} />)}
      </div>
      <div className="mt-3 flex gap-2">
        <input value={val} onChange={e=>setVal(e.target.value)} placeholder={side==='for'?'Add a FOR argument':'Add an AGAINST argument'} className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm" />
        <button onClick={()=>{ if(!val.trim()) return; onAdd(val.trim()); setVal('') }} className={`rounded-lg px-3 py-2 text-sm text-white ${side==='for'?'bg-emerald-600':'bg-rose-600'}`}>Post</button>
      </div>
    </div>
  )
}

function OpinionItem({ side, qid, opinion, onUpId, onReply }:{ side:'for'|'against', qid:string, opinion:any, onUpId:(id:string)=>void, onReply:(id:string, text:string)=>void }){
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyVal, setReplyVal] = useState('')
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2">
      <div className="flex items-start gap-2">
        <button onClick={()=>onUpId(opinion.id)} className={`px-2 py-1 text-xs rounded border ${side==='for'?'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/40':'hover:bg-rose-50 dark:hover:bg-rose-900/20 border-rose-200 dark:border-rose-900/40'}`} aria-label="+1 this opinion">+{opinion.up || 0}</button>
        <div className="text-sm flex-1">{opinion.text}</div>
      </div>
      <div className="mt-2 pl-6 border-l border-neutral-200 dark:border-neutral-800">
        {(opinion.replies||[]).slice(0,5).map((r:any) => (
          <div key={r.id} className="text-sm py-1 flex items-start gap-2">
            <span className="text-neutral-400">↳</span>
            <span className="flex-1">{r.text}</span>
          </div>
        ))}
        <div className="mt-2 flex items-center gap-2">
          {!replyOpen ? (
            <button className="text-xs px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={()=>setReplyOpen(true)}>Reply</button>
          ) : (
            <>
              <input value={replyVal} onChange={e=>setReplyVal(e.target.value)} placeholder="Write a reply…" className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs" />
              <button className="text-xs px-2 py-1 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" onClick={()=>{ if(!replyVal.trim()) return; onReply(opinion.id, replyVal.trim()); setReplyVal(''); setReplyOpen(false) }}>Post</button>
              <button className="text-xs px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={()=>setReplyOpen(false)}>Cancel</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
