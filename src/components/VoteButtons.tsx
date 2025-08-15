'use client'
export default function VoteButtons({ questionId }:{ questionId:string }){
  return (
    <div className="flex gap-2 mt-4 items-center">
      <button
        className="px-3 py-1.5 rounded-lg border border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
        onClick={async () => {
          await fetch('/api/vote', {
            method:'POST',
            headers:{'content-type':'application/json'},
            body: JSON.stringify({ questionId, side: 'for' })
          })
          location.reload()
        }}
      >+1 For</button>
      <button
        className="px-3 py-1.5 rounded-lg border border-rose-600 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
        onClick={async () => {
          await fetch('/api/vote', {
            method:'POST',
            headers:{'content-type':'application/json'},
            body: JSON.stringify({ questionId, side: 'against' })
          })
          location.reload()
        }}
      >+1 Against</button>
    </div>
  )
}
