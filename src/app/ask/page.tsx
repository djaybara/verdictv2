'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import { useAuth } from '@clerk/nextjs'

const CATEGORIES = ['Society','Health','Finance','Economy','Tech','Politics','Lifestyle','General']

export default function AskPage(){
  const { isLoaded, userId } = useAuth()
  const [title, setTitle] = useState('')
  const [cat, setCat] = useState('General')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string|undefined>()
  const router = useRouter()

  // Redirige automatiquement si déconnecté
  useEffect(()=>{
    if (isLoaded && !userId){
      router.replace('/sign-in?redirect_url=/ask')
    }
  }, [isLoaded, userId, router])

  async function submit(e:React.FormEvent){
    e.preventDefault()
    setErr(undefined)
    if (title.trim().length < 8){ setErr('Title too short'); return }
    setBusy(true)
    const res = await fetch('/api/questions', {
      method:'POST', headers:{'content-type':'application/json'},
      body: JSON.stringify({ title, category: cat })
    })
    if (res.status === 401){ setBusy(false); setErr('Please sign in to post.'); return }
    const j = await res.json().catch(()=>null)
    setBusy(false)
    if (j?.slug) router.push(`/q/${j.slug}`)
    else setErr(j?.error || 'Failed to create the question')
  }

  // Pendant qu'on charge l'état d'auth, on affiche un petit loader
  if (!isLoaded) {
    return (
      <main>
        <Header />
        <div className="max-w-2xl mx-auto p-4 text-sm text-neutral-500">Loading…</div>
      </main>
    )
  }

  // Si déconnecté, on ne montre rien (la redirection part déjà vers /sign-in)
  if (!userId) {
    return (
      <main>
        <Header />
        <div className="max-w-2xl mx-auto p-4 text-sm text-neutral-500">Redirecting to sign-in…</div>
      </main>
    )
  }

  // Connecté : on montre le formulaire
  return (
    <main>
      <Header />
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-3">Ask a question</h1>

        <form onSubmit={submit} className="grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">Question (English)</span>
            <input
              value={title}
              onChange={e=>setTitle(e.target.value)}
              placeholder="Should we ban smartphones in classrooms?"
              className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">Category</span>
            <select
              value={cat}
              onChange={e=>setCat(e.target.value)}
              className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
            >
              {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          {err && <div className="text-sm text-rose-600">{err}</div>}

          <div className="flex gap-2">
            <button
              disabled={busy}
              className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {busy ? 'Posting…' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
