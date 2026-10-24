// components/transit/BrandMark.tsx
// The Applied Agentic network glyph: two lines meeting at an interchange.
interface Props {
  size?: number
  className?: string
}

export default function BrandMark({ size = 34, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden="true" className={className}>
      <path d="M4 26 L14 16 L22 16 L30 8" fill="none" stroke="var(--l2)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 10 L14 16" fill="none" stroke="var(--l1)" strokeWidth="5" strokeLinecap="round" />
      <path d="M14 16 L20 28" fill="none" stroke="var(--l3)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="14" cy="16" r="5" fill="var(--card)" stroke="var(--ink)" strokeWidth="3" />
    </svg>
  )
}
