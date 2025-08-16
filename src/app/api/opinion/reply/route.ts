import { NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import { sql } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'

function asRows(res:any){ return Array.isArray(res) ? res : (res?.rows ?? []) }

export async function POST(req: Request){
  try{
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error:'sign-in required' }, { status: 401 })

    const { opinionId, text } = await req.json().catch(()=>({}))
    if (!opinionId || !text || String(text).trim().length<2){
      return NextResponse.json({ error:'bad_request' }, { status: 400 })
    }

    const ins = await db.execute(sql`
      INSERT INTO opinion_replies (opinion_id, text)
      VALUES (${opinionId}, ${String(text).trim()})
      RETURNING id, opinion_id AS "opinionId", text, created_at AS "createdAt";
    `)
    const row = asRows(ins)[0]
    return NextResponse.json({ ok:true, reply: row })
  }catch(e){
    console.error('POST /api/opinion/reply failed', e)
    return NextResponse.json({ error:'server_error' }, { status: 500 })
  }
}
