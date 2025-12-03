import {sanityClient, queries} from '@/lib/sanity'
import StatCard from '@/components/StatCard'
import ReactionWall from '@/components/ReactionWall'
import HireCTA from '@/components/HireCTA'

export const revalidate = 60

export default async function Home() {
  const [stats, reactions] = await Promise.all([
    sanityClient.fetch<import('@/types').StatLine[]>(queries.statLines),
    sanityClient.fetch<import('@/types').Reaction[]>(queries.approvedReactions),
  ])

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 to-gray-900 text-white">
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-center">CP3 Legacy Tracker</h1>
        <StatCard data={stats} />
        <h2 className="text-2xl font-bold mt-12 mb-6">What the world is saying right now</h2>
        <ReactionWall initial={reactions} />
      </section>
      <HireCTA />
    </main>
  )
}