'use client'
// components/public/NewsletterSection.tsx
import { useState, useEffect } from 'react'
import { Mail, ArrowRight, Sparkles } from 'lucide-react'
import { newsletterContent } from '@/content/newsletter'

export default function NewsletterSection() {
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => { setMounted(true) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    // Placeholder — replace with actual newsletter API integration
    await new Promise((r) => setTimeout(r, 800))
    setStatus('success')
    setMessage(newsletterContent.successMsg)
    setEmail('')
  }

  return (
    <section className="py-16 sm:py-20 px-4 md:px-8">
      <div
        className="max-w-3xl mx-auto rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--bg-border)',
        }}
      >
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', color: 'var(--green)' }}>
            <Sparkles size={11} />
            {newsletterContent.badge}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {newsletterContent.headline}
          </h2>
          <p className="text-sm sm:text-base mb-7 max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {newsletterContent.subheadline}
          </p>

          {!mounted ? (
            <div className="h-[48px]" />
          ) : status === 'success' ? (
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
                  placeholder={newsletterContent.placeholder}
                  required
                  className="flex-1 bg-transparent outline-none text-sm min-w-0"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white whitespace-nowrap transition-all hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-50 min-h-[48px]"
                style={{ background: 'var(--green)', color: '#000' }}
              >
                {status === 'loading' ? newsletterContent.loadingLabel : (
                  <>{newsletterContent.ctaLabel} <ArrowRight size={14} /></>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
