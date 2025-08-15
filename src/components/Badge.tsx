export default function Badge({ type }:{ type:'trending'|'controversial'|'top' }){
  const map = {
    trending: { emoji:'🔥', label:'Trending', cls:'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 border-amber-200/60 dark:border-amber-800' },
    controversial: { emoji:'⚡', label:'Controversial', cls:'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-200 border-violet-200/60 dark:border-violet-800' },
    top: { emoji:'🏆', label:'Top', cls:'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 border-emerald-200/60 dark:border-emerald-800' },
  } as const
  const b = map[type]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${b.cls}`}>
      <span>{b.emoji}</span><span>{b.label}</span>
    </span>
  )
}
