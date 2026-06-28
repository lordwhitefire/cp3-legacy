'use client'
import {useMemo, useState} from 'react'
import {StatLine} from '@/types'

const HIGHLIGHT_STATS = [
  {key: 'pts', label: 'Points', suffix: ' PPG'},
  {key: 'ast', label: 'Assists', suffix: ' APG'},
  {key: 'stl', label: 'Steals', suffix: ' SPG'},
  {key: 'fg3_pct', label: '3PT %', suffix: '%'},
  {key: 'ft_pct', label: 'FT %', suffix: '%'},
]

const EXTRA_STATS = [
  {key: 'gp', label: 'Games', suffix: ''},
  {key: 'reb', label: 'Rebounds', suffix: ' RPG'},
  {key: 'blk', label: 'Blocks', suffix: ' BPG'},
  {key: 'mp', label: 'Minutes', suffix: ' MPG'},
  {key: 'tov', label: 'Turnovers', suffix: ' TOPG'},
  {key: 'pf', label: 'Fouls', suffix: ' FPG'},
  {key: 'fg', label: 'Field Goals', suffix: ' FPG'},
  {key: 'fga', label: 'FG Attempts', suffix: ' FGAPG'},
  {key: 'fg_pct', label: 'FG %', suffix: '%'},
  {key: 'fg3', label: '3-Pointers', suffix: ' 3PG'},
  {key: 'fg3a', label: '3PT Attempts', suffix: ' 3PAPG'},
  {key: 'ft', label: 'Free Throws', suffix: ' FTPG'},
  {key: 'fta', label: 'FT Attempts', suffix: ' FTAPG'},
  {key: 'orb', label: 'Off. Rebounds', suffix: ' ORPG'},
  {key: 'drb', label: 'Def. Rebounds', suffix: ' DRPG'},
  {key: 'efg_pct', label: 'eFG %', suffix: '%'},
]

export default function StatsHero({data}: {data: StatLine[]}) {
  const [showAll, setShowAll] = useState(false)

  const career = useMemo(() => {
    const total = data.find(d => d.season === 'Career')
    if (total) return total
    const seasons = data.filter(d => d.season !== 'Career')
    if (seasons.length === 0) return null
    const summed = seasons.reduce((acc, s) => ({
      gp: acc.gp + s.gp,
      pts: acc.pts + s.pts * s.gp,
      ast: acc.ast + s.ast * s.gp,
      reb: acc.reb + s.reb * s.gp,
      stl: acc.stl + s.stl * s.gp,
      blk: acc.blk + s.blk * s.gp,
      mp: acc.mp + s.mp * s.gp,
      tov: acc.tov + s.tov * s.gp,
      pf: acc.pf + s.pf * s.gp,
      fg: acc.fg + s.fg * s.gp,
      fga: acc.fga + s.fga * s.gp,
      fg3: acc.fg3 + s.fg3 * s.gp,
      fg3a: acc.fg3a + s.fg3a * s.gp,
      ft: acc.ft + s.ft * s.gp,
      fta: acc.fta + s.fta * s.gp,
      orb: acc.orb + s.orb * s.gp,
      drb: acc.drb + s.drb * s.gp,
    }), {
      gp: 0, pts: 0, ast: 0, reb: 0, stl: 0, blk: 0,
      mp: 0, tov: 0, pf: 0, fg: 0, fga: 0,
      fg3: 0, fg3a: 0, ft: 0, fta: 0, orb: 0, drb: 0,
    })
    return {
      ...summed,
      pts: parseFloat((summed.pts / summed.gp).toFixed(1)),
      ast: parseFloat((summed.ast / summed.gp).toFixed(1)),
      reb: parseFloat((summed.reb / summed.gp).toFixed(1)),
      stl: parseFloat((summed.stl / summed.gp).toFixed(1)),
      blk: parseFloat((summed.blk / summed.gp).toFixed(1)),
      mp: parseFloat((summed.mp / summed.gp).toFixed(1)),
      tov: parseFloat((summed.tov / summed.gp).toFixed(1)),
      pf: parseFloat((summed.pf / summed.gp).toFixed(1)),
      fg: parseFloat((summed.fg / summed.gp).toFixed(1)),
      fga: parseFloat((summed.fga / summed.gp).toFixed(1)),
      fg3: parseFloat((summed.fg3 / summed.gp).toFixed(1)),
      fg3a: parseFloat((summed.fg3a / summed.gp).toFixed(1)),
      ft: parseFloat((summed.ft / summed.gp).toFixed(1)),
      fta: parseFloat((summed.fta / summed.gp).toFixed(1)),
      orb: parseFloat((summed.orb / summed.gp).toFixed(1)),
      drb: parseFloat((summed.drb / summed.gp).toFixed(1)),
    }
  }, [data])

  if (!career) {
    return <div className="text-center py-12 text-gray-500">No stats available</div>
  }

  const displayStats = showAll ? EXTRA_STATS : HIGHLIGHT_STATS

  return (
    <section>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        {displayStats.map(stat => {
          const val = career[stat.key as keyof typeof career]
          const display = typeof val === 'number' ? val.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1}) : '—'
          return (
            <div key={stat.key} className="border border-gray-800 rounded-lg p-4 text-center hover:bg-gray-900 transition-colors">
              <div className="text-2xl md:text-3xl font-bold text-white">
                {display}<span className="text-sm font-normal text-gray-500">{stat.suffix}</span>
              </div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">{stat.label}</div>
            </div>
          )
        })}
      </div>
      <button
        onClick={() => setShowAll(!showAll)}
        className="text-sm text-gray-500 hover:text-white transition-colors mx-auto block underline underline-offset-2"
      >
        {showAll ? 'Show highlights' : 'Show all stats'}
      </button>
    </section>
  )
}
