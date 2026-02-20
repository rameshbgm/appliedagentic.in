// app/(admin)/admin/menus/[id]/edit/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import MenuForm from '../../MenuForm'

export const metadata: Metadata = { title: 'Edit Menu' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditMenuPage({ params }: Props) {
  const { id } = await params
  const menu = await prisma.navMenu.findUnique({
    where: { id: parseInt(id) },
  })
  if (!menu) notFound()

  return (
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
  )
}
