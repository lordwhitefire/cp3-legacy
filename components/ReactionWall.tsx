'use client'
import {Reaction} from '@/types'
import {useState} from 'react'

const PER_PAGE = 20

export default function ReactionWall({initial}: {initial: Reaction[]}) {
  const [page, setPage] = useState(0)
  const [items, setItems] = useState(initial)

  const totalPages = Math.max(1, Math.ceil(items.length / PER_PAGE))
  const currentPage = Math.min(page, totalPages - 1)
  const pageItems = items.slice(currentPage * PER_PAGE, (currentPage + 1) * PER_PAGE)

  const handleVote = async (id: string) => {
    setItems(prev => prev.map(i => i._id === id ? {...i, likes: i.likes + 1} : i))
  }

  return (
    <div>
      {pageItems.length === 0 ? (
        <p className="text-gray-500 text-sm">No reactions yet.</p>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {pageItems.map(r => (
            <div key={r._id} className="border border-gray-800 rounded-lg p-4 break-inside-avoid hover:bg-gray-900 transition-colors">
              {r.title && <h4 className="font-semibold text-sm mb-1 text-white">{r.title}</h4>}
              <p className="text-sm text-gray-300">{r.text}</p>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="uppercase tracking-wider text-gray-500">{r.source}</span>
                  {r.author && <span>· u/{r.author}</span>}
                  {r.created && <span>· {new Date(r.created).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</span>}
                </div>
                <button onClick={() => handleVote(r._id)} className="flex items-center gap-1 text-gray-500 hover:text-white transition-colors">
                  ▲ {r.likes}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="text-sm text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="text-sm text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
