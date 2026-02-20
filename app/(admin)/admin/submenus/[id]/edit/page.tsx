// app/(admin)/admin/submenus/[id]/edit/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SubMenuForm from '../../SubMenuForm'

export const metadata: Metadata = { title: 'Edit Sub-Menu' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditSubMenuPage({ params }: Props) {
  const { id } = await params
  const subMenu = await prisma.navSubMenu.findUnique({
    where: { id: parseInt(id) },
  })
  if (!subMenu) notFound()

  const menus = await prisma.navMenu.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, title: true },
  })

  return (
    <SubMenuForm
      menus={menus}
      initial={{
        id: subMenu.id,
        title: subMenu.title,
        slug: subMenu.slug,
        menuId: subMenu.menuId,
        description: subMenu.description ?? '',
        order: subMenu.order,
        isVisible: subMenu.isVisible,
      }}
    />
  )
}
