// app/(public)/layout.tsx
import type { Metadata } from 'next'
import TransitShell from '@/components/transit/TransitShell'
import Footer from '@/components/transit/Footer'
import Splash from '@/components/transit/Splash'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import ToastNotifier from '@/components/shared/ToastNotifier'
import { ArticleLoadingProvider } from '@/components/shared/ArticleLoadingContext'
import { getNetwork, toShellLines } from '@/lib/transit'

// Navigation is edited in the database, independently of application builds.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { default: 'Applied Agentic AI', template: '%s | Applied Agentic AI' },
  description: 'Your comprehensive guide to AI agents, LLMs, and agentic systems.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://appliedagentic.in'),
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const lines = toShellLines(await getNetwork())

  return (
    <ThemeProvider>
      <ArticleLoadingProvider>
        <ToastNotifier />
        <Splash />
        <TransitShell lines={lines} />
        <main id="main" className="tr-main">
          {children}
        </main>
        <Footer lines={lines} />
      </ArticleLoadingProvider>
    </ThemeProvider>
  )
}
