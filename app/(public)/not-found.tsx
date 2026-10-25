// app/(public)/not-found.tsx
import Link from 'next/link'
import { Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="f-wrap f-lost">
      <span className="f-lost__num" aria-hidden="true">404</span>
      <h1 className="f-display">This page is missing from the book.</h1>
      <p>It may have moved to another chapter, or the link has a typo. Search the essays or return to the contents.</p>
      <div className="f-ctas" style={{ justifyContent: 'center' }}>
        <Link href="/#contents" className="f-btn f-btn--ink">The contents</Link>
        <Link href="/search" className="f-btn"><Search size={16} /> Search essays</Link>
      </div>
    </div>
  )
}
