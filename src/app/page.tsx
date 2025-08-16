import Header from '../components/Header'
import QuestionCard from '../components/QuestionCard'
import { headers } from 'next/headers'
import { isTop, isTrending, isControversial, sortTop, sortTrending, sortControversial } from '../lib/flags'

async function getQuestions(){
  const h = headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const base = `${proto}://${host}`
  const res = await fetch(`${base}/api/questions`, { cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json().catch(()=>[])
  // @ts-ignore
  return Array.isArray(data) ? data : (Array.isArray(data?.rows) ? data.rows : [])
}

export default async function Home({ searchParams }: any){
  const items = await getQuestions()
  const tab = searchParams?.tab || 'top'

  let filtered:any[] = []
  if (tab==='top') filtered = items.filter(isTop).sort(sortTop)
  else if (tab==='trending') filtered = items.filter(isTrending).sort(sortTrending)
  else if (tab==='controversial') filtered = items.filter(isControversial).sort(sortControversial)

  // si aucun match, fallback : on montre tout trié de façon cohérente
  if (filtered.length===0){
    filtered = [...items].sort(tab==='trending' ? sortTrending : tab==='controversial' ? sortControversial : sortTop)
  }

  return (
    <main>
      <Header />
      <div className="max-w-5xl mx-auto p-4 grid gap-4">
        {filtered.map((q:any) => <QuestionCard key={q.id} q={q} />)}
        {filtered.length===0 && <div className="text-neutral-500">No questions yet.</div>}
      </div>
    </main>
  )
}
