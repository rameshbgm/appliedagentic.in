// app/(public)/layout.tsx
import type { Metadata } from 'next'
import AuroraShell from '@/components/aurora/AuroraShell'
import Footer from '@/components/aurora/Footer'
import Intro from '@/components/aurora/Intro'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import ToastNotifier from '@/components/shared/ToastNotifier'
import { ArticleLoadingProvider } from '@/components/shared/ArticleLoadingContext'
import { getNetwork, toShellLines } from '@/lib/catalog'

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
        <Intro />
        <AuroraShell lines={lines} />
        <main id="main" className="a-main">{children}</main>
        <Footer lines={lines} />
      </ArticleLoadingProvider>
    </ThemeProvider>
  )
}
