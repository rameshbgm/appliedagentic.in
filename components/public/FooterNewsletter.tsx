'use client'
// components/public/FooterNewsletter.tsx
export default function FooterNewsletter() {
  return (
    <div className="flex gap-2">
      <input
        type="email"
        placeholder="you@example.com"
        className="flex-1 px-3 py-2 rounded-xl border text-[13px] outline-none transition-colors focus:border-[var(--green)]"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
      />
      <button
        className="px-3 py-2 rounded-xl text-sm font-semibold shrink-0"
        style={{ background: 'var(--green)', color: '#000' }}
      >
        →
      </button>
    </div>
  )
}
