// app/(admin)/modules/new/page.tsx
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import ModuleForm from '@/components/admin/ModuleForm'

export const metadata: Metadata = { title: 'New Module' }

export default function NewModulePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>New Module</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Create a new content module</p>
      </div>
      <ModuleForm />
    </div>
  )
}
