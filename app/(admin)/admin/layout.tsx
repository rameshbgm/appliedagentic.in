// app/(admin)/layout.tsx
import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import AdminLayoutClient from './AdminLayoutClient'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Admin – Applied Agentic AI' },
  robots: { index: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </SessionProvider>
  )
}
