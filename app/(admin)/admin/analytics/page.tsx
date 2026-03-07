// app/(admin)/analytics/page.tsx — redirected; analytics now live in Dashboard
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'

export default function AnalyticsPage() {
  redirect('/admin/dashboard')
}
