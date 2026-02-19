'use client'
// components/public/ShareButtons.tsx
import { useState } from 'react'
import { Twitter, Linkedin, Link2, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  url: string
  title: string
}

export default function ShareButtons({ url, title }: Props) {
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-medium mr-1" style={{ color: 'var(--text-muted)' }}>Share:</span>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-80 min-h-[36px]"
        style={{ background: 'rgba(29,161,242,0.12)', color: '#1DA1F2', border: '1px solid rgba(29,161,242,0.25)' }}
        aria-label="Share on Twitter"
      >
        <Twitter size={13} />
        <span className="hidden sm:inline">Twitter</span>
      </a>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-80 min-h-[36px]"
        style={{ background: 'rgba(0,119,181,0.12)', color: '#0077B5', border: '1px solid rgba(0,119,181,0.25)' }}
        aria-label="Share on LinkedIn"
      >
        <Linkedin size={13} />
        <span className="hidden sm:inline">LinkedIn</span>
      </a>
      <button
        onClick={copyLink}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-80 min-h-[36px]"
        style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--bg-border)' }}
        aria-label="Copy link"
      >
        {copied ? <Check size={13} className="text-green-400" /> : <Link2 size={13} />}
        <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy link'}</span>
      </button>
    </div>
  )
}
