// components/public/Footer.tsx
import Link from 'next/link'
import { Zap, Twitter, Linkedin, Github } from 'lucide-react'

interface Module { name: string; slug: string }
interface Props { modules?: Module[] }

export default function Footer({ modules = [] }: Props) {
  return (
    <footer
      className="border-t mt-20 py-12"
      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6C3DFF,#00D4FF)' }}>
                <Zap size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Applied Agentic AI</span>
            </Link>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Master the AI era, one concept at a time. Practical deep-dives into agentic AI, LLMs, and modern AI systems.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[
                { Icon: Twitter, href: 'https://twitter.com/appliedagentic', label: 'Twitter' },
                { Icon: Linkedin, href: 'https://linkedin.com/company/appliedagentic', label: 'LinkedIn' },
                { Icon: Github, href: 'https://github.com/appliedagentic', label: 'GitHub' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label={label}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Modules */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Modules</h4>
            <ul className="space-y-2">
              {modules.slice(0, 6).map((m) => (
                <li key={m.slug}>
                  <Link href={`/modules/${m.slug}`} className="text-xs hover:text-violet-400 transition-colors" style={{ color: 'var(--text-muted)' }}>
                    {m.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Explore</h4>
            <ul className="space-y-2">
              {[
                { href: '/articles', label: 'All Articles' },
                { href: '/search', label: 'Search' },
                { href: '/modules', label: 'All Modules' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-xs hover:text-violet-400 transition-colors" style={{ color: 'var(--text-muted)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter placeholder */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Stay Updated</h4>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Get the latest AI concepts in your inbox.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 px-3 py-2 rounded-xl border text-xs outline-none"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
              />
              <button
                className="px-3 py-2 rounded-xl text-xs font-medium text-white"
                style={{ background: 'linear-gradient(135deg,#6C3DFF,#00D4FF)' }}
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: 'var(--bg-border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} Applied Agentic AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs hover:text-violet-400 transition-colors" style={{ color: 'var(--text-muted)' }}>Privacy</Link>
            <Link href="/terms" className="text-xs hover:text-violet-400 transition-colors" style={{ color: 'var(--text-muted)' }}>Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
