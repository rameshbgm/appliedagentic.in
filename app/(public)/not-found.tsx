// app/(public)/not-found.tsx
import Link from 'next/link'
import { Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="tr-wrap tr-lost">
      <span className="tr-eyebrow">Lost property</span>
      <span className="code" aria-hidden="true">404</span>
      <h1 className="tr-display">This stop is not on the map.</h1>
      <p>The page may have moved to another line, or the link has a typo. Search the timetable or start again from the network map.</p>
      <div className="tr-ctas">
        <Link href="/" className="tr-btn tr-btn--primary">Network map</Link>
        <Link href="/search" className="tr-btn"><Search size={16} /> Search stops</Link>
      </div>
    </div>
  )
}
