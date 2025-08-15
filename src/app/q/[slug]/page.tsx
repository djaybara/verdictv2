import Header from '../../../components/Header'
import OpinionColumn from '../../../components/OpinionColumn'
import VoteBox from '../../../components/VoteBox'
import { headers } from 'next/headers'

async function getData(slug: string){
  const h = headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const base = `${proto}://${host}`
  const res = await fetch(`${base}/api/questions/${slug}`, { cache: 'no-store' })
  if (!res.ok) return null
  const data = await res.json().catch(()=>null)
  return data
}

export default async function Page({ params }:{ params: { slug: string } }){
  const q = await getData(params.slug)
  if (!q) return <main><Header /><div className="max-w-3xl mx-auto p-4">Not found.</div></main>

  const forItems = (q.opinions || []).filter((o:any)=>o.side==='for')
  const againstItems = (q.opinions || []).filter((o:any)=>o.side==='against')

  return (
    <main>
      <Header />
      <div className="max-w-5xl mx-auto p-4 grid gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="text-sm text-neutral-500">
            {q.category} • {q.createdAt ? new Date(q.createdAt).toLocaleString() : (q.created_at ? new Date(q.created_at).toLocaleString() : '')}
          </div>
          <h1 className="text-2xl font-semibold mt-1">{q.title}</h1>
          <VoteBox questionId={q.id} initialFor={q.forCount ?? 0} initialAgainst={q.againstCount ?? 0} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <OpinionColumn side="for" label="Arguments FOR" qid={q.id} items={forItems} />
          <OpinionColumn side="against" label="Arguments AGAINST" qid={q.id} items={againstItems} />
        </div>
      </div>
    </main>
  )
}
