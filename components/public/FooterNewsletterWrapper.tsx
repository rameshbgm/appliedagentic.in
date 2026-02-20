'use client'
// components/public/FooterNewsletterWrapper.tsx
import dynamic from 'next/dynamic'

const FooterNewsletter = dynamic(() => import('./FooterNewsletter'), { ssr: false })

export default function FooterNewsletterWrapper() {
  return <FooterNewsletter />
}
