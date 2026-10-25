// app/(public)/not-found.tsx
import Link from 'next/link'
import { Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="a-wrap a-lost">
      <span className="a-lost__num" aria-hidden="true">404</span>
      <h1 className="a-display">This page drifted out of the sky.</h1>
      <p>It may have moved to another path, or the link has a typo. Search the essays or pick a path to keep reading.</p>
      <div className="a-ctas" style={{ justifyContent: 'center' }}>
        <Link href="/#paths" className="a-btn a-btn--accent">See all paths</Link>
        <Link href="/search" className="a-btn"><Search size={16} /> Search essays</Link>
      </div>
    </div>
  )
}
