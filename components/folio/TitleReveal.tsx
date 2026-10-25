// components/folio/TitleReveal.tsx
// Splits a headline into words that ease in one after another (CSS in .f-words).
// The full text stays in the accessible name, so screen readers read it once.
interface Props {
  text: string
  as?: 'h1' | 'h2' | 'span'
  className?: string
  /** Wrap these words (case-insensitive) in a highlighter sweep */
  highlight?: string
}

export default function TitleReveal({ text, as: Tag = 'h1', className = '', highlight }: Props) {
  const words = text.split(/\s+/).filter(Boolean)
  const hl = highlight?.toLowerCase().split(/\s+/) ?? []
  return (
    <Tag className={`${className} f-words`} aria-label={text}>
      {words.map((w, i) => {
        const isHl = (word?: string) => !!word && hl.includes(word.toLowerCase().replace(/[^\w]/g, ''))
        // Consecutive highlighted words share one stroke: the space goes inside the mark
        const joinNext = isHl(w) && isHl(words[i + 1])
        return (
          <span key={i} aria-hidden="true">
            <span className="w" style={{ '--i': i } as React.CSSProperties}>
              {isHl(w) ? <span className="f-hl">{joinNext ? `${w}\u00A0` : w}</span> : w}
            </span>
            {i < words.length - 1 && !joinNext ? ' ' : ''}
          </span>
        )
      })}
    </Tag>
  )
}
