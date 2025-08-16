'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'

export default function OpinionColumn({ side, label, qid, items }:{
  side:'for'|'against'
  label:string
  qid:string
  items:any[]
}){
  // items contiennent potentiellement { replies: [...] }
  const [list, setList] = useState(items || [])
  const [newText, setNewText] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string|undefined>()
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({})
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const router = useRouter()

  const draftKey = `qv_draft_${qid}_${side}`

  // --- RESTAURE le brouillon si présent (et autosave à chaque frappe)
  useEffect(()=>{
    try {
      const d = localStorage.getItem(draftKey)
      if (d) setNewText(d)
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey])

  useEffect(()=>{
    try { localStorage.setItem(draftKey, newText) } catch {}
  }, [newText, draftKey])

  // +1 (déjà implémenté côté API /api/opinion/up)
  async function upvote(id:string){
    const res = await fetch('/api/opinion/up', {
      method:'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({ opinionId: id })
    })
    if (res.status === 401) return // modal géré par SignInButton pour +1/reply
    const j = await res.json().catch(()=>({ inserted:false }))
    if (j.inserted){
      setList(prev=>{
        const next = prev.map(o => o.id===id ? { ...o, up: (o.up ?? 0)+1 } : o)
        // Tri: +1 décroissant puis ancienneté
        next.sort((a:any,b:any)=>{
          const ua = a.up ?? 0, ub = b.up ?? 0
          if (ub!==ua) return ub - ua
          return new Date(a.createdAt||a.created_at).getTime() - new Date(b.createdAt||b.created_at).getTime()
        })
        return next
      })
    }
  }

  // Ajouter un argument — toujours visible.
  // Si 401 -> on sauvegarde le brouillon et on REDIRIGE vers /sign-in, avec retour sur la page.
  async function addOpinion(e:React.FormEvent){
    e.preventDefault()
    setErr(undefined)
    const text = newText.trim()
    if (text.length < 3){ setErr('Text too short'); return }
    setBusy(true)
    const res = await fetch('/api/opinion/add', {
      method:'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({ questionId: qid, side, text })
    })
    if (res.status === 401){
      try { localStorage.setItem(draftKey, newText) } catch {}
      setBusy(false)
      // redirige vers Clerk sign-in, et revient ici après connexion
      const back = typeof window !== 'undefined' ? window.location.pathname : `/q/${qid}`
      router.push(`/sign-in?redirect_url=${encodeURIComponent(back)}`)
      return
    }
    const j = await res.json().catch(()=>null)
    setBusy(false)
    if (j?.opinion){
      setList(prev=>{
        const next = [{ ...j.opinion }, ...prev]
        // re-trier (par up décroissant puis ancienneté)
        next.sort((a:any,b:any)=>{
          const ua = a.up ?? 0, ub = b.up ?? 0
          if (ub!==ua) return ub - ua
          return new Date(a.createdAt||a.created_at).getTime() - new Date(b.createdAt||b.created_at).getTime()
        })
        return next
      })
      setNewText('')
      try { localStorage.removeItem(draftKey) } catch {}
    } else {
      setErr(j?.error || 'Failed to add')
    }
  }

  // Répondre à un argument (on garde la logique existante : modal si déconnecté)
  async function addReply(opinionId:string){
    const text = (replyText[opinionId] || '').trim()
    if (text.length < 2) return
    const res = await fetch('/api/opinion/reply', {
      method:'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({ opinionId, text })
    })
    if (res.status === 401) return
    const j = await res.json().catch(()=>null)
    if (j?.reply){
      setList(prev => prev.map(o=>{
        if (o.id !== opinionId) return o
        const replies = Array.isArray(o.replies) ? o.replies.slice() : []
        replies.push(j.reply)
        return { ...o, replies }
      }))
      setReplyText(prev=>({ ...prev, [opinionId]: '' }))
      setReplyOpen(prev=>({ ...prev, [opinionId]: false }))
    }
  }

  return (
    <section className={`rounded-2xl border p-4 ${side==='for'
      ? 'border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-900/10'
      : 'border-rose-200/60 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-900/10'
    }`}>
      <h2 className="text-sm font-semibold mb-3">{label}</h2>

      {/* Formulaire AJOUTER UN ARGUMENT — TOUJOURS VISIBLE */}
      <form onSubmit={addOpinion} className="grid gap-2 mb-3">
        <textarea
          value={newText}
          onChange={e=>setNewText(e.target.value)}
          rows={3}
          placeholder={side==='for' ? 'Add a FOR argument…' : 'Add an AGAINST argument…'}
          className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
        />
        {err && <div className="text-xs text-rose-600">{err}</div>}
        <div>
          <button
            disabled={busy}
            className="px-3 py-1.5 text-xs rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {busy ? 'Posting…' : 'Post'}
          </button>
        </div>
      </form>

      {/* Liste des arguments */}
      <div className="grid gap-3">
        {list.map((o:any)=>(
          <article key={o.id} className="rounded-xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 p-3">
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{o.text}</div>
            <div className="mt-2 flex items-center gap-2">
              <div className="text-xs text-neutral-500">{new Date(o.createdAt||o.created_at).toLocaleString()}</div>
              <div className="ml-auto flex items-center gap-1">
                <span className="text-xs">{o.up ?? 0}</span>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="px-2 py-1 text-xs rounded border hover:scale-105 transition">+1</button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <button onClick={()=>upvote(o.id)} className="px-2 py-1 text-xs rounded border hover:scale-105 transition">+1</button>
                </SignedIn>
              </div>
            </div>

            {/* Réponses (1 niveau) */}
            <div className="mt-3 pl-3 border-l border-neutral-200 dark:border-neutral-800">
              {Array.isArray(o.replies) && o.replies.map((r:any)=>(
                <div key={r.id} className="py-2">
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{r.text}</div>
                  <div className="text-xs text-neutral-500">{new Date(r.createdAt||r.created_at).toLocaleString()}</div>
                </div>
              ))}

              <div className="mt-2">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="px-2 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                      Reply
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  {!replyOpen[o.id] ? (
                    <button
                      onClick={()=>setReplyOpen(prev=>({ ...prev, [o.id]: true }))}
                      className="px-2 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      Reply
                    </button>
                  ) : (
                    <div className="grid gap-2 mt-2">
                      <textarea
                        value={replyText[o.id] || ''}
                        onChange={e=>setReplyText(prev=>({ ...prev, [o.id]: e.target.value }))}
                        rows={2}
                        placeholder="Write a reply…"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={()=>addReply(o.id)}
                          className="px-2 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          Post reply
                        </button>
                        <button
                          onClick={()=>{ setReplyOpen(prev=>({ ...prev, [o.id]: false })); setReplyText(prev=>({ ...prev, [o.id]: '' })) }}
                          className="px-2 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </SignedIn>
              </div>
            </div>
          </article>
        ))}

        {(!list || list.length===0) && (
          <div className="text-sm text-neutral-500">No arguments yet.</div>
        )}
      </div>
    </section>
  )
}
