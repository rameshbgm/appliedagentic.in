// components/transit/NetworkMap.tsx
// The home page line map: one station per line, the track draws in on load.
import Link from 'next/link'
import { formatJourney, plural, type NetworkLine } from '@/lib/transit'

interface Props {
  lines: NetworkLine[]
}

export default function NetworkMap({ lines }: Props) {
  const half = Math.ceil(lines.length / 2)
  const columns = [lines.slice(0, half), lines.slice(half)]

  return (
    <div className="tr-map">
      {columns.map((col, c) => (
        <div className="tr-map__col" key={c}>
          {col.map((line, j) => {
            const i = c * half + j
            const isEnd = i === lines.length - 1
            const isColEnd = j === col.length - 1
            return (
              <Link
                key={line.id}
                href={`/${line.slug}`}
                className={`tr-station${isEnd ? ' is-end' : ''}${isColEnd ? ' is-col-end' : ''}`}
                style={{ '--c': line.color, '--i': i } as React.CSSProperties}
              >
                <div className="tr-station__track"><span className="tr-station__stop">{line.number}</span></div>
                <div className="tr-station__info">
                  <span className="tr-station__code">Line {line.number}</span>
                  <h3>{line.title}</h3>
                  {line.description && <p>{line.description}</p>}
                  {line.zones.length > 0 && (
                    <div className="tr-station__zones">
                      {line.zones.slice(0, 4).map((z) => <span key={z.id}>{z.title}</span>)}
                      {line.zones.length > 4 && <span>+{line.zones.length - 4} more</span>}
                    </div>
                  )}
                  <div className="tr-station__meta">
                    <span>{plural(line.stops, 'stop')}</span>
                    {line.zones.length > 0 && <span>{plural(line.zones.length, 'zone')}</span>}
                    {line.minutes > 0 && <span>{formatJourney(line.minutes)}</span>}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ))}
    </div>
  )
}
