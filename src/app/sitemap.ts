import { db } from '../lib/db'
import { sql } from 'drizzle-orm'

function asRows(res:any){ return Array.isArray(res) ? res : (res?.rows ?? []) }

export default async function sitemap(){
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const r = await db.execute(sql`SELECT slug, created_at AS "createdAt" FROM questions ORDER BY created_at DESC LIMIT 1000;`)
  const rows = asRows(r)
  const urls = rows.map((q:any)=>({ url: `${base}/q/${q.slug}`, lastModified: q.createdAt || new Date() }))
  return [
    { url: base, lastModified: new Date() },
    ...urls
  ]
}
