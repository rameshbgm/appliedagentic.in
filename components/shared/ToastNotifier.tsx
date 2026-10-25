'use client'
// components/shared/ToastNotifier.tsx
import { Toaster } from 'sonner'

export default function ToastNotifier() {
  return (
    <Toaster
      position="top-center"
      offset={72}
      toastOptions={{
        style: {
          background: 'var(--board)',
          color: 'var(--board-ink)',
          border: '0',
          borderRadius: '999px',
          fontFamily: 'var(--mono)',
          fontSize: '13px',
        },
      }}
    />
  )
}
