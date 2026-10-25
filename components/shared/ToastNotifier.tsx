'use client'
// components/shared/ToastNotifier.tsx
import { Toaster } from 'sonner'

export default function ToastNotifier() {
  return (
    <Toaster
      position="bottom-center"
      offset={90}
      toastOptions={{
        style: {
          background: 'var(--ink)',
          color: 'var(--paper)',
          border: '0',
          borderRadius: '999px',
          fontFamily: 'var(--ui)',
          fontWeight: 600,
          fontSize: '14px',
          justifyContent: 'center',
        },
      }}
    />
  )
}
