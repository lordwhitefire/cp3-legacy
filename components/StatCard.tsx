'use client'
import {StatLine} from '@/types'

export default function StatCard({data}: {data: StatLine[]}) {
  const totals = data.reduce(
    (acc, cur) => ({
      gp: acc.gp + cur.gp,
      pts: acc.pts + cur.pts,
      ast: acc.ast + cur.ast,
      reb: acc.reb + cur.reb,
      stl: acc.stl + cur.stl,
    }),
    {gp: 0, pts: 0, ast: 0, reb: 0, stl: 0}
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
      {(['gp', 'pts', 'ast', 'reb', 'stl'] as const).map((key) => (
        <div key={key} className="bg-white/10 rounded p-4">
          <div className="text-2xl font-bold">{totals[key].toLocaleString()}</div>
          <div className="text-sm uppercase tracking-wide">{key}</div>
        </div>
      ))}
    </div>
  )
}