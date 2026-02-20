// app/(admin)/admin/menus/page.tsx
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import MenusReorderList from './MenusReorderList'

export const metadata: Metadata = { title: 'Menus' }
export const revalidate = 0

export default async function MenusPage() {
  const menus = await prisma.navMenu.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { subMenus: true } },
      subMenus: {
        orderBy: { order: 'asc' },
        take: 5,
        select: { id: true, title: true, slug: true },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Menus</h1>
          <p className="text-sm mt-1 text-gray-500">
            {menus.length} menu{menus.length !== 1 ? 's' : ''} total — manage your site navigation
          </p>
        </div>
        <Link
          href="/admin/menus/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-black"
          style={{ background: '#AAFF00' }}
        >
          <Plus size={16} /> New Menu
        </Link>
      </div>

      {menus.length > 0 ? (
        <MenusReorderList initialMenus={menus} />
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-display mb-2 text-gray-600">No menus yet</p>
          <p className="text-sm mb-4">Create your first menu to build site navigation.</p>
          <Link
            href="/admin/menus/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-black"
            style={{ background: '#AAFF00' }}
          >
            <Plus size={14} /> Create Menu
          </Link>
        </div>
      )}
    </div>
  )
}

