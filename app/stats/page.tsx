import {sanityClient, queries} from '@/lib/sanity'
import Link from 'next/link'

export const revalidate = 60

export default async function StatsPage() {
  const data = await sanityClient.fetch<import('@/types').StatLine[]>(queries.statLines)

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 text-white">
      <Link href="/" className="text-orange-400 mb-6 inline-block">← Home</Link>
      <h1 className="text-3xl font-bold mb-6">Season-by-Season</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left">Season</th>
              <th className="px-4 py-2 text-right">GP</th>
              <th className="px-4 py-2 text-right">PTS</th>
              <th className="px-4 py-2 text-right">AST</th>
              <th className="px-4 py-2 text-right">REB</th>
              <th className="px-4 py-2 text-right">STL</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s._id} className="border-b border-white/10">
                <td className="px-4 py-2">{s.season}</td>
                <td className="px-4 py-2 text-right">{s.gp}</td>
                <td className="px-4 py-2 text-right">{s.pts}</td>
                <td className="px-4 py-2 text-right">{s.ast}</td>
                <td className="px-4 py-2 text-right">{s.reb}</td>
                <td className="px-4 py-2 text-right">{s.stl}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}