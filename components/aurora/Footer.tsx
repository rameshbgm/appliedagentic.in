// components/aurora/Footer.tsx — glass footer with the course map and a colophon
import Link from 'next/link'
import { Github, Linkedin, Twitter } from 'lucide-react'
import { footerContent } from '@/content/footer'
import { siteConfig } from '@/content/site'
import type { ShellLine } from '@/lib/catalog'

export default function Footer({ lines }: { lines: ShellLine[] }) {
  const year = new Date().getFullYear()
  return (
    <footer className="a-foot">
      <div className="a-wrap">
        <div className="a-foot__grid">
          <div className="a-foot__brand">
            <b>Applied Agentic</b>
            <p>{footerContent.brand.description}</p>
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { Icon: Twitter, href: siteConfig.social.twitter, label: 'Twitter' },
                { Icon: Linkedin, href: siteConfig.social.linkedin, label: 'LinkedIn' },
                { Icon: Github, href: siteConfig.social.github, label: 'GitHub' },
              ].map(({ Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="a-icon"><Icon size={18} /></a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="a-kicker">Paths</h4>
            <ul>
              {lines.map((l) => (
                <li key={l.id}><Link href={`/${l.slug}`} style={{ '--c': l.color } as React.CSSProperties}><span className="sw" />{l.title}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="a-kicker">Reading room</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/library">Your library</Link></li>
              <li><Link href="/search">Search</Link></li>
              {footerContent.legalLinks.map(({ href, label }) => <li key={href}><Link href={href}>{label}</Link></li>)}
            </ul>
          </div>
          <div>
            <h4 className="a-kicker">Colophon</h4>
            <p className="a-colophon">
              Headlines are set in Instrument Serif. Reading text and interface use Atkinson Hyperlegible Next,
              a face drawn by the Braille Institute so every letter stays distinct, even late at night.
            </p>
          </div>
        </div>
        <div className="a-foot__bar">
          <span>© {year} {siteConfig.name}. All rights reserved.</span>
          <nav aria-label="Legal">{footerContent.legalLinks.map(({ href, label }) => <Link key={href} href={href}>{label}</Link>)}</nav>
        </div>
      </div>
    </footer>
  )
}
