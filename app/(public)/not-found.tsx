// app/(public)/not-found.tsx
import Link from 'next/link'
import { Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="p-wrap p-lost">
      <span className="p-lost__code" aria-hidden="true"><span>4</span><span>0</span><span>4</span></span>
      <h1 className="p-display">This page wandered off.</h1>
      <p>The lesson may have moved, or the link has a typo. Search the library or head back home.</p>
      <div className="p-ctas">
        <Link href="/" className="p-btn p-btn--fill">Go home</Link>
        <Link href="/search" className="p-btn"><Search size={17} /> Search lessons</Link>
      </div>
    </div>
  )
}
