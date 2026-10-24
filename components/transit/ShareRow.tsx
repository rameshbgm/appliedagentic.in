'use client'
// components/transit/ShareRow.tsx
import { useEffect, useState } from 'react'
import { Check, Link2, Share2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  url: string
  title: string
}

const XIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
const LinkedInIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452z" /></svg>
const WhatsAppIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.82 14.01c-.25.69-1.43 1.32-1.98 1.4-.51.08-1.15.11-1.86-.12-.43-.14-.98-.32-1.69-.62-2.97-1.28-4.91-4.27-5.06-4.47-.15-.2-1.21-1.6-1.21-3.06 0-1.45.76-2.17 1.03-2.46.27-.3.59-.37.79-.37h.57c.18 0 .43-.07.67.51.25.59.84 2.04.91 2.19.07.15.12.32.02.52-.1.2-.15.32-.3.49-.15.17-.31.39-.45.52-.15.15-.3.31-.13.61.17.3.77 1.27 1.65 2.06 1.13 1.01 2.09 1.32 2.39 1.47.3.15.47.12.65-.07.17-.2.74-.86.94-1.16.2-.3.39-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.07.12.07.71-.17 1.39z" /></svg>

export default function ShareRow({ url, title }: Props) {
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)
  useEffect(() => { setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function') }, [])

  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Copy failed. Copy the address from your browser bar.')
    }
  }

  const nativeShare = async () => {
    try { await navigator.share({ title, url }) } catch { /* dismissed */ }
  }

  return (
    <div className="tr-share" aria-label="Share this article">
      {canShare && (
        <button type="button" onClick={nativeShare} aria-label="Share"><Share2 size={16} /></button>
      )}
      <button type="button" onClick={copy} aria-label="Copy link">{copied ? <Check size={16} /> : <Link2 size={16} />}</button>
      <a href={`https://twitter.com/intent/tweet?url=${u}&text=${t}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X"><XIcon /></a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn"><LinkedInIcon /></a>
      <a href={`https://wa.me/?text=${t}%20${u}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp"><WhatsAppIcon /></a>
    </div>
  )
}
