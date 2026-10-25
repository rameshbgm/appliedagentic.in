// components/transit/Footer.tsx
import Link from 'next/link'
import { Github, Linkedin, Twitter } from '@/components/shared/BrandIcons'
import BrandMark from './BrandMark'
import NewsletterForm from './NewsletterForm'
import { footerContent } from '@/content/footer'
import { siteConfig } from '@/content/site'
import type { ShellLine } from '@/lib/transit'

interface Props {
  lines: ShellLine[]
  siteName?: string
  footerText?: string | null
}

export default function Footer({ lines, siteName = siteConfig.name, footerText }: Props) {
  const year = new Date().getFullYear()
  return (
    <footer className="tr-foot">
      <div className="tr-wrap">
        <div className="tr-foot__grid">
          <div className="tr-foot__about">
            <Link href="/" className="tr-brand" aria-label="Applied Agentic home">
              <BrandMark />
              <div>
                <b>{siteName}</b>
                <span>THE AGENTIC AI NETWORK</span>
              </div>
            </Link>
            <p>{footerContent.brand.description}</p>
            <div className="tr-foot__social">
              {[
                { Icon: Twitter, href: siteConfig.social.twitter, label: 'Twitter' },
                { Icon: Linkedin, href: siteConfig.social.linkedin, label: 'LinkedIn' },
                { Icon: Github, href: siteConfig.social.github, label: 'GitHub' },
              ].map(({ Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="tr-icon-btn">
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4>Lines</h4>
            <ul>
              {lines.map((line) => (
                <li key={line.id}>
                  <Link href={`/${line.slug}`} style={{ '--c': line.color } as React.CSSProperties}>
                    <span className="dot" />{line.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>{footerContent.sections.explore}</h4>
            <ul>
              <li><Link href="/">Network map</Link></li>
              <li><Link href="/search">Search all stops</Link></li>
              {footerContent.legalLinks.map(({ href, label }) => (
                <li key={href}><Link href={href}>{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Service updates</h4>
            <p style={{ color: 'var(--ink-2)', fontSize: '.93rem', margin: '0 0 12px' }}>{footerContent.newsletterBlurb}</p>
            <NewsletterForm compact />
          </div>
        </div>

        <div className="tr-foot__bar">
          <span>{footerText || `© ${year} ${siteName}. All rights reserved.`}</span>
          <nav aria-label="Legal">
            {footerContent.legalLinks.map(({ href, label }) => (
              <Link key={href} href={href}>{label}</Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
