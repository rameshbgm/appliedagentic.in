// app/(admin)/admin/menus/new/page.tsx
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import MenuForm from '../MenuForm'

export const metadata: Metadata = { title: 'New Menu' }

export default async function NewMenuPage() {
  const last = await prisma.navMenu.findFirst({ orderBy: { order: 'desc' }, select: { order: true } })
  const nextOrder = (last?.order ?? 0) + 1
  return <MenuForm nextOrder={nextOrder} />
}
