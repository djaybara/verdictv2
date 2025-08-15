export function hoursSince(ts: string | number | Date){
  const t = typeof ts === 'string' ? new Date(ts).getTime() : ts instanceof Date ? ts.getTime() : ts
  return (Date.now() - t) / (1000 * 60 * 60)
}
export function wilsonInterval(p: number, n: number, z = 1.96){
  if(n===0) return { lower: 0, upper: 1 }
  const z2 = z*z
  const denom = 1 + z2 / n
  const center = p + z2 / (2*n)
  const margin = z * Math.sqrt((p*(1-p) + z2/(4*n))/n)
  return { lower: (center - margin)/denom, upper: (center + margin)/denom }
}
export function engagement(q: any){
  const totalVotes = (q.forCount ?? 0) + (q.againstCount ?? 0)
  const opinionUps = q.opinionUps ?? 0
  const viewPoints = Math.floor((q.views ?? 0) / 20)
  return totalVotes + opinionUps * 2 + viewPoints
}
export function hotScore(q: any){
  const e = engagement(q)
  const age = hoursSince(q.createdAt) + 2
  return e / Math.pow(age, 1.3)
}
export function trendScore(q: any){
  const e = (q.forCount ?? 0) + (q.againstCount ?? 0) + (q.opinionUps ?? 0) * 2
  const age = hoursSince(q.createdAt) + 2
  const recencyBias = Math.pow(age, 1.8)
  const freshBoost = hoursSince(q.createdAt) <= 72 ? 1 : 0.6
  return (e / recencyBias) * freshBoost
}
export function controversyScore(q: any){
  const n = (q.forCount ?? 0) + (q.againstCount ?? 0)
  if(n===0) return -1e9
  const p = (q.forCount ?? 0) / n
  const { lower, upper } = wilsonInterval(p, n)
  const width = upper - lower
  const crossesHalf = lower <= 0.5 && upper >= 0.5
  const balance = 1 - Math.abs(p - 0.5) * 2
  const credibility = Math.log10(n + 1)
  const base = balance * credibility
  const confPenalty = width
  const minVotes = 50
  const gate = n >= minVotes ? 1 : 0.3
  const crossBoost = crossesHalf ? 1 : 0.5
  return base * gate * crossBoost - confPenalty
}
