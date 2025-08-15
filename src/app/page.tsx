import Header from '../components/Header'
import QuestionCard from '../components/QuestionCard'
import { headers } from 'next/headers'

function totalVotes(q:any){ return (q.forCount ?? 0) + (q.againstCount ?? 0) }
function createdAtOf(q:any){ return q.createdAt || q.created_at || q.created }
function controversy(q:any){
  const n = totalVotes(q)
  if (n < 6) return -1 // on écarte les très faibles volumes
  const p = (q.forCount ?? 0)/n
  return 1 - Math.abs(p - 0.5) * 2 // 0..1 (1 = 50/50)
}

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
  const sorted = [...items].sort((a:any,b:any)=>{
    if (tab==='trending') {
      const ta = createdAtOf(a) ? new Date(createdAtOf(a)).getTime() : 0
      const tb = createdAtOf(b) ? new Date(createdAtOf(b)).getTime() : 0
      return tb - ta // plus récents d'abord
    }
    if (tab==='controversial') {
      return controversy(b) - controversy(a) || totalVotes(b) - totalVotes(a)
    }
    // top par nb de votes
    return totalVotes(b) - totalVotes(a)
  })
  return (
    <main>
      <Header />
      <div className="max-w-5xl mx-auto p-4 grid gap-4">
        {sorted.map((q:any) => <QuestionCard key={q.id} q={q} />)}
        {sorted.length===0 && <div className="text-neutral-500">No questions yet.</div>}
      </div>
    </main>
  )
}
