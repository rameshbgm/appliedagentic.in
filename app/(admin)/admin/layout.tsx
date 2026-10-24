// app/(admin)/layout.tsx
import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import AdminLayoutClient from './AdminLayoutClient'

const EDITOR_FONTS =
  'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;700&family=Source+Serif+4:wght@400;600&family=Libre+Baskerville:wght@400;700&family=EB+Garamond:wght@400;500&family=Crimson+Pro:wght@400;600&family=Literata:wght@400;600&family=Newsreader:wght@400;600&family=Inter:wght@400;600&family=DM+Sans:wght@400;600&family=Open+Sans:wght@400;600&family=Source+Sans+3:wght@400;600&family=Nunito:wght@400;600&display=swap'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Admin – Applied Agentic AI' },
  robots: { index: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* Article fonts authors can pick in the editor */}
      <link rel="stylesheet" href={EDITOR_FONTS} precedence="default" />
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </SessionProvider>
  )
}
