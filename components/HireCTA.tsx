'use client'
import {useState} from 'react'

export default function HireCTA() {
  const [form, setForm] = useState({name: '', email: '', message: '', budget: '< $1k'})
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/reactions', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({_type: 'gigLead', ...form, contacted: false}),
    })
    setSent(true)
  }

  if (sent)
    return <p className="text-center text-green-400">Thanks, I&apos;ll be in touch!</p>

  return (
    <form onSubmit={handleSubmit} className="sticky bottom-0 bg-gray-900 p-4 grid gap-2 md:grid-cols-4">
      <input required placeholder="Name" className="px-3 py-2 rounded bg-white/10" onChange={(e) => setForm({...form, name: e.target.value})} />
      <input required type="email" placeholder="Email" className="px-3 py-2 rounded bg-white/10" onChange={(e) => setForm({...form, email: e.target.value})} />
      <select className="px-3 py-2 rounded bg-white/10" onChange={(e) => setForm({...form, budget: e.target.value})}>
        {['< $1k', '$1k-5k', '$5k-10k', '$10k+'].map((b) => (
          <option key={b}>{b}</option>
        ))}
      </select>
      <button className="bg-orange-500 text-white px-4 py-2 rounded">Hire Me</button>
    </form>
  )
}