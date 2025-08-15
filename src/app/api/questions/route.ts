import { NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { sql } from 'drizzle-orm'

function asRows(res: any){ return Array.isArray(res) ? res : (res?.rows ?? []) }

export async function GET(){
  try {
    const r = await db.execute(sql`
      SELECT
        q.*,
        COALESCE(SUM(CASE WHEN v.side = 'for' THEN 1 ELSE 0 END), 0)::int AS "forCount",
        COALESCE(SUM(CASE WHEN v.side = 'against' THEN 1 ELSE 0 END), 0)::int AS "againstCount",
        COALESCE((SELECT COUNT(*) FROM opinion_ups ou JOIN opinions op ON op.id = ou.opinion_id WHERE op.question_id = q.id), 0)::int AS "opinionUps"
      FROM questions q
      LEFT JOIN votes v ON v.question_id = q.id
      GROUP BY q.id
      ORDER BY q.created_at DESC
      LIMIT 100;
    `)
    const rows = asRows(r)
    return NextResponse.json(rows)
  } catch (e) {
    console.error('GET /api/questions failed:', e)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: Request){
  try {
    const { title, category } = await req.json()
    if(!title || !category) return NextResponse.json({ error: 'Missing' }, { status: 400 })
    const slug = title.toLowerCase().replace(/[^a-z0-9\\s-]/g,'').trim().replace(/\\s+/g,'-').slice(0,140)
    const r = await db.execute(sql`
      INSERT INTO questions (title, slug, category)
      VALUES (${title}, ${slug}, ${category})
      RETURNING *;
    `)
    const rows = asRows(r)
    return NextResponse.json(rows[0] ?? null)
  } catch (e) {
    console.error('POST /api/questions failed:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
