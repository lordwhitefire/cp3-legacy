'use client'
import {Reaction} from '@/types'
import Link from 'next/link'

export default function NewsCard({article}: {article: Reaction}) {
  return (
    <Link
      href={`/news/${article._id}`}
      className="block border border-gray-800 rounded-lg overflow-hidden hover:bg-gray-900 transition-colors group"
    >
      {article.imageUrl ? (
        <div className="aspect-[16/9] bg-gray-900 overflow-hidden">
          <img
            src={article.imageUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-gray-900 flex items-center justify-center p-4">
          <h3 className="text-white text-lg font-bold text-center leading-tight">{article.title}</h3>
        </div>
      )}
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-2 leading-snug text-white">{article.title}</h3>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          {article.sourceName && <span>{article.sourceName}</span>}
          {article.created && (
            <>
              <span>·</span>
              <span>{new Date(article.created).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
