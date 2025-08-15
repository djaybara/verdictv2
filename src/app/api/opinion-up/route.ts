import { NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { opinionUps } from '../../../lib/schema'
import { cookies } from 'next/headers'
import crypto from 'crypto'
export async function POST(req: Request){
  try {
    const { opinionId } = await req.json()
    if(!opinionId) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    const ck = cookies()
    let uv = ck.get('uv')?.value
    if(!uv){
      uv = crypto.randomUUID()
      ck.set('uv', uv, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60*60*24*365 })
    }
    // @ts-ignore
    await db.insert(opinionUps).values({ opinionId, userKey: uv }).onConflictDoNothing({ target: [opinionUps.opinionId, opinionUps.userKey] })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('POST /api/opinion-up failed:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
