// components/transit/LineList.tsx
// Every line with its zones — used by the desktop "Lines" panel and the mobile sheet.
import Link from 'next/link'
import type { ShellLine } from '@/lib/transit'

interface Props {
  lines: ShellLine[]
  onNavigate?: () => void
}

export default function LineList({ lines, onNavigate }: Props) {
  if (lines.length === 0) {
    return <p style={{ color: 'var(--muted)' }}>Lines are being laid. Check back soon.</p>
  }
  return (
    <ul className="tr-linelist">
      {lines.map((line) => (
        <li key={line.id} style={{ '--c': line.color } as React.CSSProperties}>
          <span className="tr-roundel">{line.number}</span>
          <Link href={`/${line.slug}`} className="name" onClick={onNavigate}>
            {line.title}
          </Link>
          {line.zones.length > 0 && (
            <ul className="zones">
              {line.zones.map((zone) => (
                <li key={zone.id}>
                  <Link href={`/${line.slug}/${zone.slug}`} onClick={onNavigate}>
                    {zone.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  )
}
