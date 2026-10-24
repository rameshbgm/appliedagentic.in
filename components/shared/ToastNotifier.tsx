'use client'
// components/shared/ToastNotifier.tsx
import { Toaster } from 'sonner'

export default function ToastNotifier() {
  return (
    <Toaster
      position="top-center"
      offset={78}
      toastOptions={{
        style: {
          background: 'var(--ink)',
          color: 'var(--bg)',
          border: '0',
          borderRadius: '999px',
          fontFamily: 'var(--body)',
          fontWeight: 700,
          fontSize: '14px',
        },
      }}
    />
  )
}
