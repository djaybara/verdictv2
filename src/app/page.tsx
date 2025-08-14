// src/app/page.tsx
import Header from '../components/Header'
import { headers } from 'next/headers'

async function getQuestions(){
  // Construit une URL absolue côté serveur pour appeler l’API
  const h = headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const base = `${proto}://${host}`

  const res = await fetch(`${base}/api/questions`, { cache: 'no-store' })
  if (!res.ok) return []
  try { return await res.json() } catch { return [] }
}

export default async function Home(){
  const items = await getQuestions()

  return (
    <main>
      <Header />
      <div className="max-w-5xl mx-auto p-4 grid gap-2">
        {items.length === 0 ? (
          <div className="text-neutral-500">No questions yet.</div>
        ) : (
          items.map((q: any) => (
            <div key={q.id} className="p-3 border rounded-xl bg-white dark:bg-neutral-900">
              <div className="text-sm text-neutral-500">
                {(q.category ?? 'general')} • {q.createdAt ? new Date(q.createdAt).toLocaleString() : ''}
              </div>
              <div className="text-lg font-semibold">{q.title ?? '(untitled)'}</div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}
