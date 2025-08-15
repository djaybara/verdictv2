'use client'
import { useState } from 'react'
import RatioBar from './RatioBar'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'

export default function VoteBox({ questionId, initialFor, initialAgainst }:{
  questionId: string, initialFor: number, initialAgainst: number
}){
  const [forCount, setFor] = useState(initialFor || 0)
  const [againstCount, setAgainst] = useState(initialAgainst || 0)
  const [busy, setBusy] = useState(false)

  async function vote(side:'for'|'against'){
    if (busy) return
    setBusy(true)
    const res = await fetch('/api/vote', {
      method:'POST', headers:{'content-type':'application/json'},
      body: JSON.stringify({ questionId, side })
    })
    if (res.ok){
      const data = await res.json().catch(()=>({ inserted:false }))
      if (data.inserted) {
        if (side==='for') setFor(v=>v+1)
        else setAgainst(v=>v+1)
      }
    }
    setBusy(false)
  }

  return (
    <div>
      <SignedOut>
        <div className="flex gap-2 mt-4 items-center">
          <SignInButton mode="modal">
            <button className="px-3 py-1.5 rounded-lg border border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition">For</button>
          </SignInButton>
          <SignInButton mode="modal">
            <button className="px-3 py-1.5 rounded-lg border border-rose-600 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition">Against</button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="flex gap-2 mt-4 items-center">
          <button onClick={()=>vote('for')} disabled={busy} className="px-3 py-1.5 rounded-lg border border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition">For</button>
          <button onClick={()=>vote('against')} disabled={busy} className="px-3 py-1.5 rounded-lg border border-rose-600 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition">Against</button>
        </div>
      </SignedIn>

      <div className="mt-4">
        <RatioBar forCount={forCount} againstCount={againstCount} />
      </div>
    </div>
  )
}
