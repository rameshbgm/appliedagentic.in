'use client'
// components/aurora/NewsletterForm.tsx
import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { newsletterContent } from '@/content/newsletter'

export default function NewsletterForm({ id = 'letter' }: { id?: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

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
    return <p className="a-ok" role="status"><Check size={18} /> {newsletterContent.successMsg}</p>
  }
  return (
    <form onSubmit={onSubmit}>
      <label htmlFor={id} className="sr-only">Email address</label>
      <input id={id} className="a-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={newsletterContent.placeholder} autoComplete="email" />
      <button type="submit" className="a-btn a-btn--accent" disabled={status === 'loading'}>
        {status === 'loading' ? newsletterContent.loadingLabel : <>{newsletterContent.ctaLabel} <ArrowRight size={16} /></>}
      </button>
    </form>
  )
}
