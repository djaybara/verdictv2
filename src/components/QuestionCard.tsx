
'use client'
import RatioBar from './RatioBar'
import AISuggestions from './AISuggestions'
import OpinionColumn from './OpinionColumn'
import { useState } from 'react'
import Link from 'next/link'

export default function QuestionCard({ q, onVote, onAddOpinion, onUpOpinion, onReply }:{ q:any, onVote:(side:'for'|'against')=>void, onAddOpinion:(side:'for'|'against', text:string)=>void, onUpOpinion:(id:string)=>void, onReply:(opinionId:string, text:string)=>void }){
  const [voted, setVoted] = useState<null | 'for' | 'against'>(null)
  const allText = q.opinions.map((o:any)=>o.text).join(' ')
  function vote(side:'for'|'against'){
    if(voted) return
    onVote(side)
    setVoted(side)
  }
  return (
    <article className="bg-white dark:bg-neutral-900 rounded-2xl shadow border border-neutral-200 dark:border-neutral-800">
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
          <span className="uppercase tracking-wide">{q.category}</span>
          <span>•</span>
          <span>{new Date(q.createdAt).toLocaleString()}</span>
          <span>•</span>
          <span>{q.views} views</span>
        </div>
        <div className="flex items-start gap-2">
          <Link href={`/q/${q.slug}`} className="text-left text-lg font-semibold mb-3 flex-1 hover:underline">{q.title}</Link>
          <button onClick={()=>navigator.clipboard?.writeText(window.location.origin + '/q/' + q.slug)} className="text-xs px-2 py-1 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 border-neutral-300 dark:border-neutral-700" title="Copy link">Copy link</button>
        </div>

        <div className="flex gap-2 mb-3 items-center">
          <button onClick={()=>vote('for')} disabled={!!voted} className={`px-3 py-1.5 rounded-lg border ${voted?'border-neutral-300 dark:border-neutral-700 text-neutral-400 cursor-not-allowed':'border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}>{voted==='for'? 'Voted: For' : '+1 For'}</button>
          <button onClick={()=>vote('against')} disabled={!!voted} className={`px-3 py-1.5 rounded-lg border ${voted?'border-neutral-300 dark:border-neutral-700 text-neutral-400 cursor-not-allowed':'border-rose-600 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20'}`}>{voted==='against'? 'Voted: Against' : '+1 Against'}</button>
          <div className="ml-auto text-sm text-neutral-600 dark:text-neutral-400">Total votes: {(q.forCount||0)+(q.againstCount||0)}</div>
        </div>

        <RatioBar forCount={q.forCount||0} againstCount={q.againstCount||0} />

        <AISuggestions questionId={q.id} allOpinionText={allText} onAdd={(side, text)=>onAddOpinion(side, text)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-4">
        <OpinionColumn side="for" label="Arguments FOR" qid={q.id} opinions={q.opinions.filter((o:any)=>o.side==='for')} onUpId={(id)=>onUpOpinion(id)} onAdd={(text)=>onAddOpinion('for', text)} onReply={(id,text)=>onReply(id,text)} />
        <OpinionColumn side="against" label="Arguments AGAINST" qid={q.id} opinions={q.opinions.filter((o:any)=>o.side==='against')} onUpId={(id)=>onUpOpinion(id)} onAdd={(text)=>onAddOpinion('against', text)} onReply={(id,text)=>onReply(id,text)} />
      </div>
    </article>
  )
}
