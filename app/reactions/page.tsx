import {sanityClient, queries} from '@/lib/sanity'
import ReactionWall from '@/components/ReactionWall'
import Link from 'next/link'

export const revalidate = 60

export default async function ReactionsPage() {
  const data = await sanityClient.fetch<import('@/types').Reaction[]>(queries.approvedReactions)

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 text-white">
      <Link href="/" className="text-orange-400 mb-6 inline-block">← Home</Link>
      <h1 className="text-3xl font-bold mb-6">Real-Time Reactions</h1>
      <ReactionWall initial={data} />
    </main>
  )
}