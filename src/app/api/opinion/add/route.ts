import { NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import { sql } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'

function asRows(res:any){ return Array.isArray(res) ? res : (res?.rows ?? []) }

export async function POST(req: Request){
  try{
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error:'sign-in required' }, { status: 401 })

    const { questionId, side, text } = await req.json().catch(()=>({}))
    if (!questionId || (side!=='for' && side!=='against') || !text || String(text).trim().length<3){
      return NextResponse.json({ error:'bad_request' }, { status: 400 })
    }

    const ins = await db.execute(sql`
      INSERT INTO opinions (question_id, side, text)
      VALUES (${questionId}, ${side}, ${String(text).trim()})
      RETURNING id, question_id AS "questionId", side, text, created_at AS "createdAt";
    `)
    const row = asRows(ins)[0]
    return NextResponse.json({ ok:true, opinion: { ...row, up:0, replies:[] } })
  }catch(e){
    console.error('POST /api/opinion/add failed', e)
    return NextResponse.json({ error:'server_error' }, { status: 500 })
  }
}
