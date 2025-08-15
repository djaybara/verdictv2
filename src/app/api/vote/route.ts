import { NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { sql } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'

function asRows(res:any){ return Array.isArray(res) ? res : (res?.rows ?? []) }

export async function POST(req: Request){
  try {
    const { questionId, side } = await req.json()
    if(!questionId || (side!=='for' && side!=='against')){
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    const { userId } = auth()
    if (!userId){
      return NextResponse.json({ ok: false, inserted: false }, { status: 401 })
    }
    const r = await db.execute(sql`
      INSERT INTO votes (question_id, user_key, user_id, side)
      VALUES (${questionId}, ${userId}, ${userId}, ${side})
      ON CONFLICT (question_id, user_id) DO NOTHING
      RETURNING 1;
    `)
    const inserted = asRows(r).length > 0
    return NextResponse.json({ ok: true, inserted })
  } catch (e) {
    console.error('POST /api/vote failed:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
