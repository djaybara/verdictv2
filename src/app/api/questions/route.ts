import { NextResponse } from 'next/server'

export async function GET() {
  // demo: renvoie un JSON vide pour que la home fonctionne tout de suite
  return NextResponse.json([])
}