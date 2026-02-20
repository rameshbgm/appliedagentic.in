// app/(admin)/admin/submenus/page.tsx
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import SubMenusReorderList from './SubMenusReorderList'
import SubMenuFilter from './SubMenuFilter'

export const metadata: Metadata = { title: 'Sub-Menus' }
export const revalidate = 0

interface Props {
  searchParams: Promise<{ menuId?: string }>
}

export default async function SubMenusPage({ searchParams }: Props) {
  const sp = await searchParams
  const menuId = sp.menuId ? parseInt(sp.menuId) : undefined

  const subMenus = await prisma.navSubMenu.findMany({
    where: menuId ? { menuId } : {},
    orderBy: [{ menu: { order: 'asc' } }, { order: 'asc' }],
    include: {
      menu: { select: { id: true, title: true, slug: true } },
      _count: { select: { articles: true } },
    },
  })

  const menus = await prisma.navMenu.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, title: true },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Sub-Menus</h1>
          <p className="text-sm mt-1 text-gray-500">
            {subMenus.length} sub-menu{subMenus.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          href="/admin/submenus/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-black"
          style={{ background: '#AAFF00' }}
        >
          <Plus size={16} /> New Sub-Menu
        </Link>
      </div>

      {/* Filter by Menu */}
      <SubMenuFilter menus={menus} currentMenuId={menuId} />

      {subMenus.length > 0 ? (
        <SubMenusReorderList initialSubMenus={subMenus} />
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-display mb-2 text-gray-600">No sub-menus yet</p>
          <p className="text-sm mb-4">Create your first sub-menu to organise articles.</p>
          <Link
            href="/admin/submenus/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-black"
            style={{ background: '#AAFF00' }}
          >
            <Plus size={14} /> Create Sub-Menu
          </Link>
        </div>
      )}
    </div>
  )
}

