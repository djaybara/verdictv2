import Link from 'next/link'
import RatioBar from './RatioBar'
import Badge from './Badge'

function totalVotes(q:any){ return (q.forCount ?? 0) + (q.againstCount ?? 0) }
function createdAtOf(q:any){ return q.createdAt || q.created_at || q.created }

export default function QuestionCard({ q }:{ q:any }){
  const created = createdAtOf(q)
  const n = totalVotes(q)
  const p = n ? (q.forCount ?? 0)/n : 0.5
  const balance = 1 - Math.abs(p - 0.5) * 2
  // seuils souples pour que tu voies des badges
  const isTrending = created && (Date.now() - new Date(created).getTime()) <= 7*24*3600*1000 && n >= 1
  const isControversial = n >= 6 && balance >= 0.6
  const isTop = n >= 10 && (q.views ?? 0) >= 10

  return (
    <article className="bg-white dark:bg-neutral-900 rounded-2xl shadow border border-neutral-200 dark:border-neutral-800 p-4 transition-transform duration-200 ease-out hover:shadow-2xl hover:-translate-y-1.5">
      <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
        <span className="uppercase tracking-wide">{q.category}</span>
        <span>•</span>
        <span>{created ? new Date(created).toLocaleString() : ''}</span>
        <span>•</span>
        <span>{q.views ?? 0} views</span>
        <div className="ml-auto flex items-center gap-1">
          {isTop && <Badge type="top" />}
          {isTrending && <Badge type="trending" />}
          {isControversial && <Badge type="controversial" />}
        </div>
      </div>
      <Link href={`/q/${q.slug || q.id}`} className="text-left text-lg font-semibold mb-3 block hover:underline">{q.title}</Link>
      <RatioBar forCount={q.forCount ?? 0} againstCount={q.againstCount ?? 0} />
    </article>
  )
}
