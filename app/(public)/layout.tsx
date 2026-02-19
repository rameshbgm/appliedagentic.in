// app/(public)/layout.tsx
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import ToastNotifier from '@/components/shared/ToastNotifier'
import Loader3D from '@/components/shared/Loader3D'

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

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const modules = await getModules()

  return (
    <ThemeProvider>
      <ToastNotifier />
      <Loader3D />
      <Navbar modules={modules} />
      <main className="min-h-screen pt-16">
        {children}
      </main>
      <Footer modules={modules} />
    </ThemeProvider>
  )
}
