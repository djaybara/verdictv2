
'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function NewQuestion(){
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('general')
  const [status, setStatus] = useState<string | null>(null)

  async function submit(e: React.FormEvent){
    e.preventDefault()
    setStatus('Saving...')
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title, category })
    })
    if (res.ok) {
      setStatus('Saved! Go back to Home.')
      setTitle('')
    } else {
      const t = await res.text()
      setStatus('Error: ' + t)
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Create a question</h1>
        <Link href="/" className="text-sm underline">← Back</Link>
      </div>
      <form onSubmit={submit} className="grid gap-3 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <label className="grid gap-1">
          <span className="text-sm">Title</span>
          <input value={title} onChange={e=>setTitle(e.target.value)} required placeholder="e.g., Are LED face masks worth it?" className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2" />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Category</span>
          <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="beauty" className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2" />
        </label>
        <button className="rounded-lg px-3 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">Create</button>
        {status && <div className="text-sm text-neutral-600 dark:text-neutral-400">{status}</div>}
      </form>
    </main>
  )
}
