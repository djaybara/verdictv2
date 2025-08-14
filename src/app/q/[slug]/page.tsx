import { headers } from 'next/headers'

async function getData(slug: string){
  const h = headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const base = `${proto}://${host}`

  const res = await fetch(`${base}/api/questions/${slug}`, { cache: 'no-store' })
  if (!res.ok) return null
  try { return await res.json() } catch { return null }
}


export default async function Page({ params }:{ params: { slug: string } }){
  const q = await getData(params.slug)

  async function vote(side: 'for'|'against'){
    'use server'
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/vote`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ questionId: q.id, side }) })
  }
  async function addOpinion(side: 'for'|'against', text: string){
    'use server'
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/opinions`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ questionId: q.id, side, text }) })
  }
  async function upOpinion(opinionId: string){
    'use server'
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/opinion-up`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ opinionId }) })
  }
  async function replyOpinion(opinionId: string, text: string){
    'use server'
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/replies`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ opinionId, text }) })
  }

  return (
    <main>
      <Header />
      <div className="max-w-5xl mx-auto p-4 grid gap-4">
        <QuestionCard q={q} onVote={vote} onAddOpinion={addOpinion} onUpOpinion={upOpinion} onReply={replyOpinion} />
        <section className="bg-white dark:bg-neutral-900 rounded-2xl shadow border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="text-base font-semibold mb-2">Debate</div>
          {(q.debate || []).length===0 ? (
            <div className="text-sm text-neutral-500">No debate messages yet.</div>
          ) : (
            <div className="grid gap-2">
              {(q.debate || []).map((d:any)=> (
                <div key={d.id} className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-2 flex items-start gap-2">
                  <div className="text-xs px-2 py-1 rounded border">+{d.up || 0}</div>
                  <div className="text-sm flex-1">{d.text}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
