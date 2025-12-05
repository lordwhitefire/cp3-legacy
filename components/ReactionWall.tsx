'use client'
import {Reaction} from '@/types'
import {useState} from 'react'

export default function ReactionWall({initial}: {initial: Reaction[]}) {
  const [items, setItems] = useState(initial)

  const handleVote = async (id: string) => {
    // optimistic + mutate omitted for brevity
    setItems((prev) =>
      prev.map((i) => (i._id === id ? {...i, likes: i.likes + 1} : i))  // ✅ likes
    )
  }

  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
      {items.map((r) => (
        <div key={r._id} className="bg-white/5 rounded p-4 break-inside-avoid">
          <p className="text-sm">{r.text}</p>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-gray-400">{r.source}</span>
            <button onClick={() => handleVote(r._id)} className="text-orange-400">
              ▲ {r.likes}  {/* ✅ likes */}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
