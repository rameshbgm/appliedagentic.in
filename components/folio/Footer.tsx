// components/folio/Footer.tsx — with a book-style colophon
import Link from 'next/link'
import { Github, Linkedin, Twitter } from 'lucide-react'
import { footerContent } from '@/content/footer'
import { siteConfig } from '@/content/site'
import type { ShellLine } from '@/lib/catalog'

export default function Footer({ lines }: { lines: ShellLine[] }) {
  const year = new Date().getFullYear()
  return (
    <footer className="f-foot">
      <div className="f-wrap">
        <div className="f-foot__grid">
          <div className="f-foot__brand">
            <b>Applied Agentic</b>
            <p>{footerContent.brand.description}</p>
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { Icon: Twitter, href: siteConfig.social.twitter, label: 'Twitter' },
                { Icon: Linkedin, href: siteConfig.social.linkedin, label: 'LinkedIn' },
                { Icon: Github, href: siteConfig.social.github, label: 'GitHub' },
              ].map(({ Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="f-icon"><Icon size={18} /></a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="f-kicker">Contents</h4>
            <ul>
              {lines.map((l) => (
                <li key={l.id}><Link href={`/${l.slug}`} style={{ '--c': l.color } as React.CSSProperties}><span className="sw" />{l.title}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="f-kicker">Reading room</h4>
            <ul>
              <li><Link href="/">Front page</Link></li>
              <li><Link href="/library">Your library</Link></li>
              <li><Link href="/search">Search</Link></li>
              {footerContent.legalLinks.map(({ href, label }) => <li key={href}><Link href={href}>{label}</Link></li>)}
            </ul>
          </div>
          <div>
            <h4 className="f-kicker">Colophon</h4>
            <p className="f-colophon">
              Headlines are set in Fraunces, a soft old-style face. The reading text is Spectral, a serif drawn for long reading on screens.
              The interface uses Manrope.
            </p>
          </div>
        </div>
        <div className="f-foot__bar">
          <span>© {year} {siteConfig.name}. All rights reserved.</span>
          <nav aria-label="Legal">{footerContent.legalLinks.map(({ href, label }) => <Link key={href} href={href}>{label}</Link>)}</nav>
        </div>
      </div>
    </footer>
  )
}
