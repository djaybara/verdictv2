/** Petites métriques de base */
export function metrics(q:any){
  const created = q.createdAt || q.created_at || q.created
  const n = (q.forCount ?? 0) + (q.againstCount ?? 0)
  const views = q.views ?? 0
  const p = n ? (q.forCount ?? 0) / n : 0.5
  const balance = 1 - Math.abs(p - 0.5) * 2 // 0..1 (1=50/50)
  const ageMs = created ? (Date.now() - new Date(created).getTime()) : Number.POSITIVE_INFINITY
  const hours = ageMs / 3.6e6
  return { created, n, views, p, balance, hours }
}

/** Wilson lower bound (95%) pour classer "Top" par qualité + volume */
export function wilsonScore(q:any, z=1.96){
  const { n, p } = metrics(q)
  if (n === 0) return 0
  const z2 = z*z
  const denom = 1 + z2/n
  const center = p + z2/(2*n)
  const margin = z * Math.sqrt((p*(1-p) + z2/(4*n))/n)
  return (center - margin) / denom
}

/** Badges */
export function isTrending(q:any){ const { hours, n } = metrics(q); return hours <= 168 && n >= 1 }
export function isControversial(q:any){ const { n, balance } = metrics(q); return n >= 6 && balance >= 0.6 }
export function isTop(q:any){
  const { n, views } = metrics(q)
  // seuils souples pour apparaître en "Top"
  return (wilsonScore(q) >= 0.55 && n >= 8) || (n >= 20) || (views >= 40)
}

/** Tris */
export function sortTop(a:any,b:any){
  const sa = wilsonScore(a); const sb = wilsonScore(b)
  if (sb!==sa) return sb - sa
  const na = (a.forCount??0)+(a.againstCount??0)
  const nb = (b.forCount??0)+(b.againstCount??0)
  if (nb!==na) return nb - na
  return (b.views??0) - (a.views??0)
}
export function sortTrending(a:any,b:any){
  const ta = (a.createdAt||a.created_at||a.created) ? new Date(a.createdAt||a.created_at||a.created).getTime() : 0
  const tb = (b.createdAt||b.created_at||b.created) ? new Date(b.createdAt||b.created_at||b.created).getTime() : 0
  return tb - ta
}
export function sortControversial(a:any,b:any){
  const ba = (()=>{ const {n,balance}=metrics(a); return n<6?-1:balance })()
  const bb = (()=>{ const {n,balance}=metrics(b); return n<6?-1:balance })()
  if (bb!==ba) return bb - ba
  const na = (a.forCount??0)+(a.againstCount??0)
  const nb = (b.forCount??0)+(b.againstCount??0)
  return nb - na
}
