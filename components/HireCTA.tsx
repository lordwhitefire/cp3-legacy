'use client'
import {useState} from 'react'
import { ChevronUp, MessageSquare, X, Check, Mail, User, DollarSign } from 'lucide-react'

export default function HireCTA() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
    budget: '< $100'
  })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/gig', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to submit')
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setExpanded(false)
    setSent(false)
    setForm({ name: '', email: '', message: '', budget: '< $100' })
  }

  if (!expanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setExpanded(true)}
          className="bg-white hover:bg-gray-200 text-black p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        >
          <div className="flex flex-col items-center">
            <MessageSquare className="w-8 h-8" />
            <span className="text-xs mt-1 font-medium">Hire Me</span>
          </div>
        </button>
      </div>
    )
  }

  if (sent) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-80 bg-black rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800 rounded-lg">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Success!</h3>
              <p className="text-xs text-gray-500">Quote requested</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-5">
          <h4 className="text-center text-xl font-bold text-white mb-2">Thanks, {form.name}!</h4>
          <p className="text-center text-gray-400 mb-4">
            I&apos;ll email you at <span className="font-medium text-white">{form.email}</span> within 24 hours.
          </p>
        </div>
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleClose} className="w-full bg-white hover:bg-gray-200 text-black py-2.5 rounded-lg font-medium transition-colors">
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-black rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-800 rounded-lg">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">Get a Quote</h3>
            <p className="text-xs text-gray-500">Email response within 24h</p>
          </div>
        </div>
        <button onClick={() => setExpanded(false)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        <div>
          <label className="block text-xs text-gray-500 mb-2 font-medium">Your Name *</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <User className="w-4 h-4 text-gray-500" />
            </div>
            <input
              required
              placeholder="John Doe"
              className="w-full pl-10 pr-3 py-3 rounded-xl bg-gray-900 border border-gray-700 focus:border-white focus:outline-none text-white placeholder-gray-500 text-sm"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              disabled={loading}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-2 font-medium">Email Address *</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Mail className="w-4 h-4 text-gray-500" />
            </div>
            <input
              required
              type="email"
              placeholder="john@example.com"
              className="w-full pl-10 pr-3 py-3 rounded-xl bg-gray-900 border border-gray-700 focus:border-white focus:outline-none text-white placeholder-gray-500 text-sm"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              disabled={loading}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-2 font-medium">Project Budget *</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <DollarSign className="w-4 h-4 text-gray-500" />
            </div>
            <select
              className="w-full pl-10 pr-3 py-3 rounded-xl bg-gray-900 border border-gray-700 focus:border-white focus:outline-none text-white appearance-none cursor-pointer text-sm"
              value={form.budget}
              onChange={(e) => setForm({...form, budget: e.target.value})}
              disabled={loading}
            >
              <option value="" disabled>Select budget</option>
              {['< $100', '$100-500', '$500-1k', '$1k+'].map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronUp className="w-4 h-4 text-gray-500 rotate-180" />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-2 font-medium">Project Details (Optional)</label>
          <textarea
            placeholder="Tell me about your project..."
            className="w-full px-3 py-3 rounded-xl bg-gray-900 border border-gray-700 focus:border-white focus:outline-none text-white placeholder-gray-500 text-sm min-h-[100px] resize-none"
            value={form.message}
            onChange={(e) => setForm({...form, message: e.target.value})}
            disabled={loading}
            rows={3}
          />
        </div>
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">No spam, ever</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">Email reply within 24h</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">Free consultation included</span>
          </div>
        </div>
      </form>
      <div className="p-4 border-t border-gray-800">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-white hover:bg-gray-200 text-black py-3 rounded-xl font-bold shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
              Sending...
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" />
              Get Quote via Email
            </>
          )}
        </button>
      </div>
    </div>
  )
}
