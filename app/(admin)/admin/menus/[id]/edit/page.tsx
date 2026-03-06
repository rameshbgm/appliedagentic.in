// app/(admin)/admin/menus/[id]/edit/page.tsx
export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import MenuForm from '../../MenuForm'
import MenuSubMenusPanel from '../../MenuSubMenusPanel'

export const metadata: Metadata = { title: 'Edit Menu' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditMenuPage({ params }: Props) {
  const { id } = await params
  const menu = await prisma.navMenu.findUnique({
    where: { id: parseInt(id) },
    include: {
      subMenus: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          slug: true,
          isVisible: true,
          order: true,
          _count: { select: { articles: true } },
        },
      },
    },
  })
  if (!menu) notFound()

  return (
    <div className="space-y-10">
      <MenuForm
        initial={{
          id: menu.id,
          title: menu.title,
          slug: menu.slug,
          description: menu.description ?? '',
          order: menu.order,
          isVisible: menu.isVisible,
        }}
      />

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--bg-border)' }} />

      {/* Sub-menus linked to this menu */}
      <MenuSubMenusPanel
        menuId={menu.id}
        menuTitle={menu.title}
        initialSubMenus={menu.subMenus}
      />
    </div>
  )
}
