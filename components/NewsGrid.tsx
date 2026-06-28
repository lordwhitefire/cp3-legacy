import {sanityClient, queries} from '@/lib/sanity'
import NewsCard from './NewsCard'

export default async function NewsGrid() {
  const articles = await sanityClient.fetch<import('@/types').Reaction[]>(queries.newsArticles)

  if (articles.length === 0) {
    return <p className="text-gray-500 text-sm">No news articles yet.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {articles.slice(0, 5).map(a => (
        <NewsCard key={a._id} article={a} />
      ))}
    </div>
  )
}
