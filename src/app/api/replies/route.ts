import { NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { opinionReplies } from '../../../lib/schema'
export async function POST(req: Request){
  try {
    const { opinionId, text } = await req.json()
    if(!opinionId || !text) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    const [row] = await db.insert(opinionReplies).values({ opinionId, text }).returning()
    return NextResponse.json(row)
  } catch (e) {
    console.error('POST /api/replies failed:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
