
export default function RatioBar({ forCount, againstCount, forLabel='For', againstLabel='Against' }:{ forCount:number, againstCount:number, forLabel?:string, againstLabel?:string }){
  const total = forCount + againstCount
  const p = total === 0 ? 50 : Math.round((forCount/total)*100)
  return (
    <div>
      <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-1">
        <span>{forLabel} {p}% ({forCount})</span>
        <span>{againstLabel} {100-p}% ({againstCount})</span>
      </div>
      <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden flex">
        <div className="h-full bg-emerald-500" style={{ width: `${p}%` }} />
        <div className="h-full bg-rose-500" style={{ width: `${100-p}%` }} />
      </div>
    </div>
  )
}
