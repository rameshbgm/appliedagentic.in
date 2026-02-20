// app/(public)/layout.tsx
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import ToastNotifier from '@/components/shared/ToastNotifier'
import Loader3D from '@/components/shared/Loader3D'
import RouteProgress from '@/components/shared/RouteProgress'

export const metadata: Metadata = {
  title: { default: 'Applied Agentic AI', template: '%s | Applied Agentic AI' },
  description: 'Your comprehensive guide to AI agents, LLMs, and agentic systems.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://appliedagentic.in'),
}

async function getModules() {
  try {
    return await prisma.module.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
      select: { id: true, name: true, slug: true, icon: true, color: true },
    })
  } catch {
    return []
  }
}

async function getNavMenus() {
  try {
    return await prisma.navMenu.findMany({
      where: { isVisible: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        subMenus: {
          where: { isVisible: true },
          orderBy: { order: 'asc' },
          select: { id: true, title: true, slug: true, description: true },
        },
      },
    })
  } catch {
    return []
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [modules, navMenus] = await Promise.all([getModules(), getNavMenus()])

  return (
    <ThemeProvider>
      <ToastNotifier />
      <RouteProgress />
      <Loader3D />
      <Navbar navMenus={navMenus} />
      <main className="min-h-screen pt-16">
        {children}
      </main>
      <Footer modules={modules} />
    </ThemeProvider>
  )
}
