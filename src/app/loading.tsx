export default function Loading(){
  return (
    <div className="max-w-5xl mx-auto p-4 grid gap-4">
      {[...Array(4)].map((_,i)=>(
        <div key={i} className="h-28 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900/60 animate-pulse" />
      ))}
    </div>
  )
}
