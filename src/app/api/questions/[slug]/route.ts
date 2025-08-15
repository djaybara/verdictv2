import { NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import { sql } from 'drizzle-orm'

function asRows(res: any){ return Array.isArray(res) ? res : (res?.rows ?? []) }

export async function GET(_req: Request, { params }: { params: { slug: string } }){
  try {
    const key = params.slug
    const r1 = await db.execute(sql`
      SELECT q.*,
        COALESCE(SUM(CASE WHEN v.side='for' THEN 1 ELSE 0 END),0)::int AS "forCount",
        COALESCE(SUM(CASE WHEN v.side='against' THEN 1 ELSE 0 END),0)::int AS "againstCount"
      FROM questions q
      LEFT JOIN votes v ON v.question_id = q.id
      WHERE q.slug = ${key} OR q.id::text = ${key}
      GROUP BY q.id
      LIMIT 1;
    `)
    const rows = asRows(r1)
    const q = rows[0]
    if(!q) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const r2 = await db.execute(sql`
      SELECT o.*,
        COALESCE((SELECT COUNT(*) FROM opinion_ups ou WHERE ou.opinion_id = o.id),0)::int AS up
      FROM opinions o
      WHERE o.question_id = ${q.id}
      ORDER BY up DESC, o.created_at ASC
      LIMIT 200;
    `)
    const opinions = asRows(r2)

    let replies: any[] = []
    if (opinions.length) {
      const ids = opinions.map((o:any)=>o.id)
      const r3 = await db.execute(sql`
        SELECT r.* FROM opinion_replies r
        WHERE r.opinion_id = ANY(${sql.array(ids, 'uuid')})
        ORDER BY r.created_at ASC;
      `)
      replies = asRows(r3)
    }

    const replyMap = new Map<string, any[]>()
    for(const r of replies) {
      const arr = replyMap.get(r.opinionId) ?? []
      arr.push(r)
      replyMap.set(r.opinionId, arr)
    }
    const withReplies = opinions.map((o:any) => ({ ...o, replies: replyMap.get(o.id) ?? [] }))

    return NextResponse.json({ ...q, opinions: withReplies })
  } catch (e) {
    console.error('GET /api/questions/[slug] failed:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
