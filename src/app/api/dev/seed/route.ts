import { NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import { sql } from 'drizzle-orm'
function asRows(res:any){ return Array.isArray(res) ? res : (res?.rows ?? []) }
export async function GET(){
  try {
    const now = new Date()
    const qs = [
      { title: 'Should we ban smartphones in classrooms?', category: 'Society', createdAt: new Date(now.getTime()- 2*60*60*1000) },
      { title: 'Is intermittent fasting healthy for most people?', category: 'Health', createdAt: new Date(now.getTime()- 26*60*60*1000) },
      { title: 'Are cryptocurrencies good long-term investments?', category: 'Finance', createdAt: new Date(now.getTime()- 4*24*60*60*1000) },
      { title: 'Should tipping be included by default in restaurants?', category: 'Economy', createdAt: new Date(now.getTime()- 6*24*60*60*1000) },
      { title: 'Will AI replace most marketing jobs?', category: 'Tech', createdAt: new Date(now.getTime()- 12*60*60*1000) },
    ]
    const inserted:any[] = []
    for (const q of qs){
      const slug = q.title.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').slice(0,140)
      const r = await db.execute(sql`
        INSERT INTO questions (title, slug, category, views, created_at)
        VALUES (${q.title}, ${slug}, ${q.category}, ${Math.floor(Math.random()*120)}, ${q.createdAt})
        ON CONFLICT (slug) DO NOTHING
        RETURNING id, slug;
      `)
      const row = asRows(r)[0] || asRows(await db.execute(sql`SELECT id, slug FROM questions WHERE slug = ${slug} LIMIT 1;`))[0]
      if (row) inserted.push(row)
    }
    for (const q of inserted){
      const forTexts = ['Backed by data.', 'Practical to implement.', 'Cost-effective.']
      const agTexts  = ['Risky side-effects.', 'Evidence is mixed.', 'May cause inequality.']
      for (const t of forTexts.slice(0, 2 + Math.floor(Math.random()*2))){
        await db.execute(sql`INSERT INTO opinions (question_id, side, text) VALUES (${q.id}, 'for', ${t});`)
      }
      for (const t of agTexts.slice(0, 2 + Math.floor(Math.random()*2))){
        await db.execute(sql`INSERT INTO opinions (question_id, side, text) VALUES (${q.id}, 'against', ${t});`)
      }
      const total = 12 + Math.floor(Math.random()*20)
      const forCount = Math.floor(total*(0.35 + Math.random()*0.3))
      const againstCount = total - forCount
      for (let i=0;i<forCount;i++)
        await db.execute(sql`INSERT INTO votes (question_id, user_key, side) VALUES (${q.id}, ${'seed_u_for_'+i}, 'for') ON CONFLICT DO NOTHING;`)
      for (let i=0;i<againstCount;i++)
        await db.execute(sql`INSERT INTO votes (question_id, user_key, side) VALUES (${q.id}, ${'seed_u_against_'+i}, 'against') ON CONFLICT DO NOTHING;`)
    }
    return NextResponse.json({ ok: true, inserted })
  } catch (e){
    console.error('seed failed', e)
    return NextResponse.json({ error: 'seed failed' }, { status: 500 })
  }
}
