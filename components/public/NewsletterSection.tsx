'use client'
// components/public/NewsletterSection.tsx
import { useState } from 'react'
import { Mail, ArrowRight, Sparkles } from 'lucide-react'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    // Placeholder — replace with actual newsletter API integration
    await new Promise((r) => setTimeout(r, 800))
    setStatus('success')
    setMessage("You're on the list! We'll notify you of new content.")
    setEmail('')
  }

  return (
    <section className="py-16 sm:py-20 px-4 md:px-8">
      <div
        className="max-w-3xl mx-auto rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.08))',
          border: '1px solid rgba(124,58,237,0.25)',
        }}
      >
        {/* Background glows */}
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: '#7C3AED' }} />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: '#06B6D4' }} />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA' }}>
            <Sparkles size={11} />
            Stay in the loop
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Get the latest AI insights
          </h2>
          <p className="text-sm sm:text-base mb-7 max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
            New articles on AI agents, LLMs, and agentic systems — straight to your inbox. No spam.
          </p>

          {status === 'success' ? (
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium"
              style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399', border: '1px solid rgba(52,211,153,0.25)' }}>
              ✓ {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-2xl"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)' }}>
                <Mail size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 bg-transparent outline-none text-sm min-w-0"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white whitespace-nowrap transition-all hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-50 min-h-[48px]"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}
              >
                {status === 'loading' ? 'Subscribing...' : (
                  <>Subscribe <ArrowRight size={14} /></>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
