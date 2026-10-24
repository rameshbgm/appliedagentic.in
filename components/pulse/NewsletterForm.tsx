'use client'
// components/pulse/NewsletterForm.tsx
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
  const id = compact ? 'newsletter-footer' : 'newsletter-band'

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    // Placeholder until a newsletter provider is connected
    await new Promise((r) => setTimeout(r, 700))
    setStatus('success')
    setEmail('')
  }

  if (status === 'success') {
    return (
      <p className="p-ok" role="status">
        <Check size={18} /> {newsletterContent.successMsg}
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <label htmlFor={id} className="sr-only">Email address</label>
      <input
        id={id}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={newsletterContent.placeholder}
        autoComplete="email"
        className="p-input"
        style={compact ? { minHeight: 46, flexBasis: 180 } : undefined}
      />
      <button type="submit" className={`p-btn ${compact ? 'p-btn--sm p-btn--fill' : 'p-btn--fill'}`} disabled={status === 'loading'}>
        {status === 'loading' ? newsletterContent.loadingLabel : <>{newsletterContent.ctaLabel} <ArrowRight size={16} /></>}
      </button>
    </form>
  )
}
