import { NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import { sql } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'

function asRows(res:any){ return Array.isArray(res) ? res : (res?.rows ?? []) }

export async function POST(req: Request){
  try{
    const { userId } = auth()
    if (!userId) return NextResponse.json({ ok:false, inserted:false }, { status: 401 })

    const { opinionId } = await req.json().catch(()=>({}))
    if (!opinionId || typeof opinionId !== 'string') {
      return NextResponse.json({ error:'invalid' }, { status: 400 })
    }

    const r = await db.execute(sql`
      INSERT INTO opinion_ups (opinion_id, user_key)
      VALUES (${opinionId}, ${userId})
      ON CONFLICT (opinion_id, user_key) DO NOTHING
      RETURNING 1;
    `)
    const inserted = asRows(r).length > 0
    return NextResponse.json({ ok:true, inserted })
  }catch(e){
    console.error('POST /api/opinion/up failed', e)
    return NextResponse.json({ ok:false, inserted:false }, { status: 500 })
  }
}
