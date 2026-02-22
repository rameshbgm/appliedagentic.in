// components/public/Footer.tsx
import Link from 'next/link'
import { Zap, Twitter, Linkedin, Github } from 'lucide-react'
import FooterNewsletterWrapper from './FooterNewsletterWrapper'
import { footerContent } from '@/content/footer'
import { siteConfig }   from '@/content/site'

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
                style={{ background: 'var(--green)' }}>
                <Zap size={15} className="text-black" />
              </div>
              <span className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>{siteConfig.name}</span>
            </Link>
            <p className="text-[13px] leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
              {footerContent.brand.description}
            </p>
            <div className="flex items-center gap-2">
              {[
                { Icon: Twitter,  href: siteConfig.social.twitter,  label: 'Twitter'  },
                { Icon: Linkedin, href: siteConfig.social.linkedin, label: 'LinkedIn' },
                { Icon: Github,   href: siteConfig.social.github,   label: 'GitHub'   },
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
              {footerContent.sections.modules}
            </h4>
            <ul className="space-y-2.5">
              {modules.slice(0, 6).map((m) => (
                <li key={m.slug}>
                  <Link href={`/modules/${m.slug}`}
                    className="text-[13px] transition-colors hover:text-[var(--green)]"
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
              {footerContent.sections.explore}
            </h4>
            <ul className="space-y-2.5">
              {footerContent.exploreLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-[13px] transition-colors hover:text-[var(--green)]" style={{ color: 'var(--text-secondary)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
              {footerContent.sections.newsletter}
            </h4>
            <p className="text-[13px] mb-3" style={{ color: 'var(--text-muted)' }}>{footerContent.newsletterBlurb}</p>
            <FooterNewsletterWrapper />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6"
          style={{ borderTop: '1px solid var(--bg-border)' }}>
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            {footerContent.copyright}
          </p>
          <div className="flex items-center gap-4">
            {footerContent.legalLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="text-[12px] transition-colors hover:text-[var(--green)]" style={{ color: 'var(--text-muted)' }}>{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
