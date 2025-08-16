import { NextResponse } from 'next/server'

type Payload = { lang: 'en'|'fr'|'es'|'de', texts: string[] }

async function runCloudflare(prompt:string){
  const acc = process.env.CLOUDFLARE_ACCOUNT_ID
  const tok = process.env.CLOUDFLARE_API_TOKEN
  if (!acc || !tok) return null
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
    const { lang, texts } = await req.json() as Payload
    if (!Array.isArray(texts) || !lang) return NextResponse.json({ error:'bad_request' }, { status: 400 })

    const tgt = ['en','fr','es','de'].includes(lang) ? lang : 'en'
    const items = texts.slice(0, 50).map(s => (s || '').slice(0, 2000))

    // Pas besoin de traduire vers EN, ou pas de Cloudflare -> renvoie original
    if (tgt === 'en') return NextResponse.json({ lang: tgt, translations: items })

    // OpenAI clé présente ? (si plus tard tu en ajoutes une)
    const key = process.env.OPENAI_API_KEY
    if (key){
      const sys = `Translate to ${tgt.toUpperCase()}.
Return ONLY strict JSON: {"translations":["...","..."]}`
      const user = JSON.stringify({ texts: items })
      const r = await fetch('https://api.openai.com/v1/chat/completions',{
        method:'POST',
        headers:{ 'content-type':'application/json', 'authorization':`Bearer ${key}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini-translator',
          temperature: 0.2, response_format: { type:'json_object' },
          messages: [ { role:'system', content: sys }, { role:'user', content: user } ]
        })
      })
      const data = await r.json().catch(()=>null)
      const content = data?.choices?.[0]?.message?.content
      try {
        const j = content ? JSON.parse(content) : null
        if (Array.isArray(j?.translations)) return NextResponse.json({ lang:tgt, translations: j.translations })
      } catch {}
    }

    // Cloudflare gratuit
    const instr = `Translate the following array of texts to ${tgt.toUpperCase()}.
Return ONLY strict JSON: {"translations":[ "...", "..." ]}`
    const cfText = await runCloudflare(`${instr}\n\nINPUT:\n${JSON.stringify({ texts: items })}`)
    if (cfText){
      try {
        const j = JSON.parse(cfText)
        if (Array.isArray(j?.translations)) return NextResponse.json({ lang:tgt, translations: j.translations })
      } catch {}
    }

    // Fallback: pas de traduction
    return NextResponse.json({ lang: tgt, translations: items })
  }catch(e){
    console.error('AI translate failed', e)
    return NextResponse.json({ lang:'en', translations: [] }, { status: 200 })
  }
}
