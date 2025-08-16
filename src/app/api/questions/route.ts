import { NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { sql } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'

function asRows(res:any){ return Array.isArray(res) ? res : (res?.rows ?? []) }
function slugify(t:string){
  return t.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').slice(0,140)
}

export async function GET(){
  const r = await db.execute(sql`
    SELECT q.*,
      COALESCE(SUM(CASE WHEN v.side='for' THEN 1 ELSE 0 END),0)::int AS "forCount",
      COALESCE(SUM(CASE WHEN v.side='against' THEN 1 ELSE 0 END),0)::int AS "againstCount"
    FROM questions q
    LEFT JOIN votes v ON v.question_id = q.id
    GROUP BY q.id
    ORDER BY q.created_at DESC
    LIMIT 500;
  `)
  return NextResponse.json(asRows(r))
}

export async function POST(req: Request){
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'sign-in required' }, { status: 401 })

  const { title, category } = await req.json().catch(()=>({}))
  if (!title || typeof title!=='string' || title.trim().length < 8){
    return NextResponse.json({ error: 'Title too short (min 8 chars)' }, { status: 400 })
  }
  const cat = (category && typeof category==='string') ? category.slice(0,32) : 'General'

  const base = slugify(title)
  let slug = base
  for (let i=2; i<50; i++){
    const check = await db.execute(sql`SELECT 1 FROM questions WHERE slug = ${slug} LIMIT 1;`)
    if (asRows(check).length === 0) break
    slug = `${base}-${i}`
  }

  const ins = await db.execute(sql`
    INSERT INTO questions (title, slug, category, views)
    VALUES (${title.trim()}, ${slug}, ${cat}, 0)
    RETURNING id, slug;
  `)
  const row = asRows(ins)[0]
  return NextResponse.json({ ok:true, ...row })
}
