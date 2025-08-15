export default function Loading(){
  return (
    <main>
      <div className="max-w-5xl mx-auto p-4 grid gap-4">
        {[...Array(3)].map((_,i)=>(
          <div key={i} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 animate-pulse">
            <div className="h-3 w-40 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
            <div className="h-5 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded mb-3" />
            <div className="h-2.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
        ))}
      </div>
    </main>
  )
}
