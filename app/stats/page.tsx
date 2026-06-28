import {sanityClient, queries} from '@/lib/sanity'
import Link from 'next/link'
import StatsHero from '@/components/StatsHero'

export const revalidate = 60

export default async function StatsPage() {
  const data = await sanityClient.fetch<import('@/types').StatLine[]>(queries.statLines)

  return (
    <main className="bg-black min-h-screen max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors mb-6 inline-block">
        ← Back to Home
      </Link>
      <h1 className="text-3xl font-bold mb-2">Season-by-Season</h1>
      <p className="text-gray-500 text-sm mb-8">Chris Paul career stats, season by season</p>

      <StatsHero data={data} />

      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-4 py-2 text-left font-medium text-gray-500">Season</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">GP</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">PTS</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">AST</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">REB</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">STL</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">BLK</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">FG%</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">3P%</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">FT%</th>
            </tr>
          </thead>
          <tbody>
            {data.filter(d => d.season !== 'Career').map((s) => (
              <tr key={s._id} className="border-b border-gray-800 hover:bg-gray-900 transition-colors">
                <td className="px-4 py-2 font-medium">{s.season}</td>
                <td className="px-4 py-2 text-right">{s.gp}</td>
                <td className="px-4 py-2 text-right">{s.pts}</td>
                <td className="px-4 py-2 text-right">{s.ast}</td>
                <td className="px-4 py-2 text-right">{s.reb}</td>
                <td className="px-4 py-2 text-right">{s.stl}</td>
                <td className="px-4 py-2 text-right">{s.blk}</td>
                <td className="px-4 py-2 text-right">{s.fg_pct}%</td>
                <td className="px-4 py-2 text-right">{s.fg3_pct}%</td>
                <td className="px-4 py-2 text-right">{s.ft_pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
