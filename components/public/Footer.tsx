// components/public/Footer.tsx
import Link from 'next/link'
import { Zap, Twitter, Linkedin, Github } from 'lucide-react'

interface Module { name: string; slug: string }
interface Props  { modules?: Module[] }

export default function Footer({ modules = [] }: Props) {
  return (
    <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--bg-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#06B6D4)' }}>
                <Zap size={15} className="text-white" />
              </div>
              <span className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>Applied Agentic AI</span>
            </Link>
            <p className="text-[13px] leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
              Master the AI era, one concept at a time. Practical deep-dives into agentic AI, LLMs,
              and modern AI systems.
            </p>
            <div className="flex items-center gap-2">
              {[
                { Icon: Twitter, href: 'https://twitter.com/appliedagentic',           label: 'Twitter'  },
                { Icon: Linkedin, href: 'https://linkedin.com/company/appliedagentic', label: 'LinkedIn' },
                { Icon: Github,   href: 'https://github.com/appliedagentic',           label: 'GitHub'   },
              ].map(({ Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="p-2 rounded-lg transition-colors hover:bg-white/8"
                  style={{ color: 'var(--text-muted)' }}>
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Modules */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
              Modules
            </h4>
            <ul className="space-y-2.5">
              {modules.slice(0, 6).map((m) => (
                <li key={m.slug}>
                  <Link href={`/modules/${m.slug}`}
                    className="text-[13px] transition-colors hover:text-violet-400"
                    style={{ color: 'var(--text-secondary)' }}>
                    {m.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
              Explore
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: '/articles', label: 'All Articles' },
                { href: '/modules',  label: 'All Modules'  },
                { href: '/search',   label: 'Search'       },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-[13px] transition-colors hover:text-violet-400" style={{ color: 'var(--text-secondary)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
              Stay Updated
            </h4>
            <p className="text-[13px] mb-3" style={{ color: 'var(--text-muted)' }}>Get the latest AI concepts in your inbox.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 px-3 py-2 rounded-xl border text-[13px] outline-none transition-colors focus:border-violet-500"
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
              />
              <button
                className="px-3 py-2 rounded-xl text-sm font-semibold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#06B6D4)' }}
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6"
          style={{ borderTop: '1px solid var(--bg-border)' }}>
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} Applied Agentic AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-[12px] transition-colors hover:text-violet-400" style={{ color: 'var(--text-muted)' }}>Privacy</Link>
            <Link href="/terms"   className="text-[12px] transition-colors hover:text-violet-400" style={{ color: 'var(--text-muted)' }}>Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
