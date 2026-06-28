import {sanityClient, queries} from '@/lib/sanity'
import {notFound} from 'next/navigation'
import Link from 'next/link'

export const revalidate = 60

export default async function NewsDetail({params}: {params: Promise<{id: string}>}) {
  const {id} = await params
  const article = await sanityClient.fetch<import('@/types').Reaction | null>(queries.reactionById, {id})

  if (!article || article.source !== 'news') notFound()

  return (
    <main className="bg-black min-h-screen max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors mb-6 inline-block">
        ← Back to Home
      </Link>

      <article>
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            {article.sourceName && <span>{article.sourceName}</span>}
            {article.created && (
              <time dateTime={article.created}>
                {new Date(article.created).toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                })}
              </time>
            )}
          </div>
        </header>

        {article.imageUrl && (
          <div className="mb-8 aspect-[16/9] bg-gray-900 rounded-lg overflow-hidden">
            <img
              src={article.imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {article.url && (
          <div className="border border-gray-800 rounded-lg p-4 bg-gray-900">
            <p className="text-sm text-gray-300 mb-3">{article.text}</p>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-white hover:text-gray-300 transition-colors underline underline-offset-2"
            >
              Read full article →
            </a>
          </div>
        )}
      </article>
    </main>
  )
}
