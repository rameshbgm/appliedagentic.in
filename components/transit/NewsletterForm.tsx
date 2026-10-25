'use client'
// components/transit/NewsletterForm.tsx
import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { newsletterContent } from '@/content/newsletter'

interface Props {
  /** Footer variant: light surface instead of the dark band. */
  compact?: boolean
}

export default function NewsletterForm({ compact = false }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [error, setError] = useState('')
  const id = compact ? 'newsletter-footer' : 'newsletter-band'

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: compact ? 'footer' : 'homepage' }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not save your subscription.')
      setStatus('success')
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not connect. Please try again.')
      setStatus('idle')
    }
  }

  if (status === 'success') {
    return (
      <p className={compact ? undefined : 'ok'} role="status" style={compact ? { display: 'flex', gap: 8, alignItems: 'center', color: 'var(--success)', fontWeight: 600, margin: 0 } : undefined}>
        <Check size={16} style={{ display: 'inline', verticalAlign: '-3px' }} /> {newsletterContent.successMsg}
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} style={compact ? { display: 'flex', flexWrap: 'wrap', gap: 8 } : undefined}>
      <label htmlFor={id} className="sr-only">Email address</label>
      <input
        id={id}
        type="email"
        required
        maxLength={254}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={newsletterContent.placeholder}
        autoComplete="email"
        className={compact ? 'input' : undefined}
        style={compact ? { flex: '1 1 180px', minWidth: 0, borderRadius: 999, minHeight: 44 } : undefined}
      />
      <button type="submit" className={`tr-btn ${compact ? 'tr-btn--primary' : 'tr-btn--notice'}`} disabled={status === 'loading'}>
        {status === 'loading' ? newsletterContent.loadingLabel : <>{newsletterContent.ctaLabel} <ArrowRight size={16} /></>}
      </button>
      {error && <p id={`${id}-error`} role="alert" style={{ flexBasis: '100%', margin: '8px 0 0', fontSize: '.9rem' }}>{error}</p>}
    </form>
  )
}
