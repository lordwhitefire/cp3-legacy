import {sanityClient, queries} from '@/lib/sanity'
import ReactionWall from '@/components/ReactionWall'
import Link from 'next/link'

export const revalidate = 60

export default async function ReactionsPage() {
  const data = await sanityClient.fetch<import('@/types').Reaction[]>(queries.approvedReactions)

  return (
    <main className="bg-black min-h-screen max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors mb-6 inline-block">
        ← Back to Home
      </Link>
      <h1 className="text-3xl font-bold mb-2">Fan Reactions</h1>
      <p className="text-gray-500 text-sm mb-8">What the world is saying about Chris Paul</p>
      <ReactionWall initial={data} />
    </main>
  )
}
