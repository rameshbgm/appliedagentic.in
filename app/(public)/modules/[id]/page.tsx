// app/(public)/modules/[id]/page.tsx
// Module detail pages have been replaced by nav menu pages — redirect to home
import { redirect } from 'next/navigation'

export default function ModuleDetailPage() {
  redirect('/')
}
