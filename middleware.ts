import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SUP = ['en','fr','es','de']

export function middleware(req: NextRequest){
  const res = NextResponse.next()
  const has = req.cookies.get('qlang')?.value
  if (!has){
    const al = req.headers.get('accept-language') || ''
    const cand = al.split(',')[0]?.split('-')[0]?.toLowerCase() || 'en'
    const lang = SUP.includes(cand) ? cand : 'en'
    res.cookies.set('qlang', lang, { path:'/', maxAge: 60*60*24*365 })
  }
  return res
}

export const config = { matcher: ['/((?!_next|.*\\..*).*)'] }
