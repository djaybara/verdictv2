import { NextResponse } from 'next/server'

type Mini = { text: string; up?: number }

function fallbackSummary(forItems:Mini[], againstItems:Mini[]){
  const topFor = [...forItems].sort((a,b)=>(b.up||0)-(a.up||0)).slice(0,2).map(x=>x.text)
  const topAg  = [...againstItems].sort((a,b)=>(b.up||0)-(a.up||0)).slice(0,2).map(x=>x.text)
  return {
    for: topFor.length ? `Main points: ${topFor.join(' · ')}` : 'No strong FOR arguments yet.',
    against: topAg.length ? `Main points: ${topAg.join(' · ')}` : 'No strong AGAINST arguments yet.',
    missing_angles: []
  }
}

async function runCloudflare(prompt:string){
  const acc = process.env.CLOUDFLARE_ACCOUNT_ID
  const tok = process.env.CLOUDFLARE_API_TOKEN
  if (!acc || !tok) return null
  // Modèle léger mais correct pour résumé/“reasoning”
  const model = '@cf/meta/llama-3.2-3b-instruct'
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${acc}/ai/run/${model}`,{
    method:'POST',
    headers:{ 'content-type':'application/json', 'authorization':`Bearer ${tok}` },
    body: JSON.stringify({ prompt })
  })
  const j = await res.json().catch(()=>null)
  const text = j?.result?.response || ''
  return text || null
}

export async function POST(req: Request){
  try{
    const { forItems, againstItems } = await req.json()
    const key = process.env.OPENAI_API_KEY

    // 1) Si OpenAI dispo -> OpenAI
    if(key){
      const sys = `You summarize a debate with two columns (FOR / AGAINST).
Weigh each point by its upvote count. Output concise, neutral English (max 2-3 sentences per side).
Return strict JSON:
{"for": "...", "against": "...", "missing_angles": ["...", "...", "..."]}`
      const user = JSON.stringify({
        for: (forItems||[]).map((x:Mini)=>({ text:x.text, up:x.up||0 })),
        against: (againstItems||[]).map((x:Mini)=>({ text:x.text, up:x.up||0 })),
      })
      const res = await fetch('https://api.openai.com/v1/chat/completions',{
        method:'POST',
        headers:{ 'content-type':'application/json', 'authorization':`Bearer ${key}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [ { role:'system', content: sys }, { role:'user', content: user } ]
        })
      })
      const data = await res.json().catch(()=>null)
      const content = data?.choices?.[0]?.message?.content
      const json = content ? JSON.parse(content) : fallbackSummary(forItems||[], againstItems||[])
      return NextResponse.json(json)
    }

    // 2) Sinon Cloudflare (gratuit)
    const baseInstr = `Summarize a two-sided debate (FOR vs AGAINST).
Weight arguments by upvotes. Return ONLY strict JSON:
{"for":"...", "against":"...", "missing_angles":["...","..."]}`
    const payload = {
      for: (forItems||[]).map((x:Mini)=>({ text:x.text, up:x.up||0 })),
      against: (againstItems||[]).map((x:Mini)=>({ text:x.text, up:x.up||0 })),
    }
    const cfText = await runCloudflare(`${baseInstr}\n\nINPUT:\n${JSON.stringify(payload)}`)
    if (cfText){
      try { return NextResponse.json(JSON.parse(cfText)) } catch {}
    }

    // 3) Fallback local
    return NextResponse.json(fallbackSummary(forItems||[], againstItems||[]))
  }catch(e){
    console.error('AI summary failed', e)
    return NextResponse.json({ for:'', against:'', missing_angles:[] }, { status: 200 })
  }
}
