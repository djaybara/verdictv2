import { NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { opinions } from '../../../lib/schema'
export async function POST(req: Request){
  try {
    const { questionId, side, text } = await req.json()
    if(!questionId || (side!=='for' && side!=='against') || !text) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    const [row] = await db.insert(opinions).values({ questionId, side, text }).returning()
    return NextResponse.json(row)
  } catch (e) {
    console.error('POST /api/opinions failed:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
