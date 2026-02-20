// app/(admin)/admin/submenus/new/page.tsx
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import SubMenuForm from '../SubMenuForm'

export const metadata: Metadata = { title: 'New Sub-Menu' }

export default async function NewSubMenuPage() {
  const [menus, lastSubMenu] = await Promise.all([
    prisma.navMenu.findMany({ orderBy: { order: 'asc' }, select: { id: true, title: true } }),
    prisma.navSubMenu.findFirst({ orderBy: { order: 'desc' }, select: { order: true } }),
  ])
  const nextOrder = (lastSubMenu?.order ?? 0) + 1

  return <SubMenuForm menus={menus} nextOrder={nextOrder} />
}
