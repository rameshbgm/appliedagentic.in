// components/pulse/Footer.tsx
import Link from 'next/link'
import { Github, Linkedin, Twitter } from 'lucide-react'
import NewsletterForm from './NewsletterForm'
import { footerContent } from '@/content/footer'
import { siteConfig } from '@/content/site'
import type { ShellLine } from '@/lib/catalog'

interface Props {
  lines: ShellLine[]
}

export default function Footer({ lines }: Props) {
  const year = new Date().getFullYear()
  return (
    <footer className="p-foot">
      {/* Endless wordmark ticker */}
      <div className="p-foot__word" aria-hidden="true">
        {Array.from({ length: 4 }, (_, i) => <span key={i}>Applied Agentic</span>)}
      </div>

      <div className="p-wrap">
        <div className="p-foot__grid">
          <div className="p-foot__about">
            <Link href="/" className="p-mark" style={{ display: 'inline-flex', boxShadow: 'none', padding: 0, background: 'none' }} aria-label="Applied Agentic home">
              <span className="p-mark__dot" aria-hidden="true" />
              <b>Applied Agentic</b>
            </Link>
            <p>{footerContent.brand.description}</p>
            <div className="p-foot__social">
              {[
                { Icon: Twitter, href: siteConfig.social.twitter, label: 'Twitter' },
                { Icon: Linkedin, href: siteConfig.social.linkedin, label: 'LinkedIn' },
                { Icon: Github, href: siteConfig.social.github, label: 'GitHub' },
              ].map(({ Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="p-round p-round--sm">
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="p-label">Modules</h4>
            <ul>
              {lines.map((l) => (
                <li key={l.id}>
                  <Link href={`/${l.slug}`} style={{ '--c': l.color } as React.CSSProperties}>
                    <span className="sw" />{l.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="p-label">{footerContent.sections.explore}</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/search">Search the library</Link></li>
              {footerContent.legalLinks.map(({ href, label }) => (
                <li key={href}><Link href={href}>{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="p-label">Stay in the loop</h4>
            <p style={{ color: 'var(--ink-2)', margin: '0 0 12px' }}>{footerContent.newsletterBlurb}</p>
            <NewsletterForm compact />
          </div>
        </div>

        <div className="p-foot__bar">
          <span>© {year} {siteConfig.name}. All rights reserved.</span>
          <nav aria-label="Legal">
            {footerContent.legalLinks.map(({ href, label }) => <Link key={href} href={href}>{label}</Link>)}
          </nav>
        </div>
      </div>
    </footer>
  )
}
