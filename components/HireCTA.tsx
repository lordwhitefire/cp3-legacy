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
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit')
      }
      
      setSent(true)
      
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Reset form and close
  const handleClose = () => {
    setExpanded(false)
    setSent(false)
    setForm({ name: '', email: '', message: '', budget: '< $100' })
  }

  // Compact view (collapsed)
  if (!expanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setExpanded(true)}
          className="group relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 flex items-center justify-center"
        >
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
            !
          </div>
          <div className="flex flex-col items-center">
            <MessageSquare className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="text-xs mt-1 font-medium">Hire Me</span>
          </div>
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Click to get quote
          </div>
        </button>
      </div>
    )
  }

  // Success view
  if (sent) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-80 bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden animate-in slide-in-from-bottom-10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Check className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-bold text-white">Success!</h3>
              <p className="text-xs text-gray-400">Quote requested</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-5">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
          
          <h4 className="text-center text-xl font-bold text-white mb-2">
            Thanks, {form.name}!
          </h4>
          <p className="text-center text-gray-300 mb-4">
            I&apos;ve received your quote request and will email you at <br/>
            <span className="text-orange-400 font-medium">{form.email}</span> <br/>
            within 24 hours.
          </p>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
              <User className="w-4 h-4 text-blue-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-400">Name</p>
                <p className="text-white font-medium">{form.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
              <Mail className="w-4 h-4 text-blue-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-white font-medium">{form.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
              <DollarSign className="w-4 h-4 text-green-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-400">Budget</p>
                <p className="text-white font-medium">{form.budget}</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300 text-center">
              <span className="inline-block mr-2">📧</span>
              Check your email inbox for my response
            </p>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleClose}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  // Expanded form view
  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden animate-in slide-in-from-bottom-10">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <MessageSquare className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="font-bold text-white">Get a Quote</h3>
            <p className="text-xs text-gray-400">Email response within 24h</p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(false)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Name */}
        <div>
          <label className="block text-xs text-gray-400 mb-2 font-medium">
            Your Name *
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <User className="w-4 h-4 text-gray-500" />
            </div>
            <input 
              required 
              placeholder="John Doe" 
              className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-orange-500 focus:outline-none text-white placeholder-gray-500 text-sm"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              disabled={loading}
            />
          </div>
        </div>
        
        {/* Email */}
        <div>
          <label className="block text-xs text-gray-400 mb-2 font-medium">
            Email Address *
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Mail className="w-4 h-4 text-gray-500" />
            </div>
            <input 
              required 
              type="email" 
              placeholder="john@example.com" 
              className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-orange-500 focus:outline-none text-white placeholder-gray-500 text-sm"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              disabled={loading}
            />
          </div>
        </div>
        
        {/* Budget */}
        <div>
          <label className="block text-xs text-gray-400 mb-2 font-medium">
            Project Budget *
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <DollarSign className="w-4 h-4 text-gray-500" />
            </div>
            <select 
              className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-orange-500 focus:outline-none text-white appearance-none cursor-pointer text-sm"
              value={form.budget}
              onChange={(e) => setForm({...form, budget: e.target.value})}
              disabled={loading}
            >
              <option value="" disabled className="bg-gray-900">Select budget</option>
              {['< $100', '$100-500', '$500-1k', '$1k+'].map((b) => (
                <option key={b} value={b} className="bg-gray-900">
                  {b}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronUp className="w-4 h-4 text-gray-500 rotate-180" />
            </div>
          </div>
        </div>
        
        {/* Message */}
        <div>
          <label className="block text-xs text-gray-400 mb-2 font-medium">
            Project Details (Optional)
          </label>
          <textarea
            placeholder="Tell me about your project..."
            className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-orange-500 focus:outline-none text-white placeholder-gray-500 text-sm min-h-[100px] resize-none"
            value={form.message}
            onChange={(e) => setForm({...form, message: e.target.value})}
            disabled={loading}
            rows={3}
          />
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {error}
            </p>
          </div>
        )}
        
        {/* Features */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-400">No spam, ever</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-400">Email reply within 24h</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-400">Free consultation included</span>
          </div>
        </div>
      </form>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-orange-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Sending...
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" />
              Get Quote via Email
            </>
          )}
        </button>
        
        <p className="text-center text-xs text-gray-500 mt-3">
          You&apos;ll receive a confirmation email
        </p>
      </div>
    </div>
  )
}