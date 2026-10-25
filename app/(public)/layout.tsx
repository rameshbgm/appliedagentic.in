// app/(public)/layout.tsx
import type { Metadata } from 'next'
import TransitShell from '@/components/transit/TransitShell'
import Footer from '@/components/transit/Footer'
import Splash from '@/components/transit/Splash'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import ToastNotifier from '@/components/shared/ToastNotifier'
import { ArticleLoadingProvider } from '@/components/shared/ArticleLoadingContext'
import { getNetwork, toShellLines } from '@/lib/transit'
import { getSiteSettings } from '@/lib/site-settings'

// Navigation is edited in the database, independently of application builds.
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    title: { default: settings.siteName, template: `%s | ${settings.siteName}` },
    description: settings.metaDescription,
    metadataBase: new URL(settings.siteUrl),
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [network, settings] = await Promise.all([getNetwork(), getSiteSettings()])
  const lines = toShellLines(network)

  return (
    <ThemeProvider>
      <ArticleLoadingProvider>
        <ToastNotifier />
        <Splash />
        <TransitShell lines={lines} siteName={settings.siteName} />
        <main id="main" className="tr-main">
          {children}
        </main>
        <Footer lines={lines} siteName={settings.siteName} footerText={settings.footerText} />
      </ArticleLoadingProvider>
    </ThemeProvider>
  )
}
