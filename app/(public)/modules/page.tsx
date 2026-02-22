// app/(public)/modules/page.tsx
// Learning modules have been replaced by nav menus — redirect to home
import { redirect } from 'next/navigation'

export default function ModulesPage() {
  redirect('/')
}
