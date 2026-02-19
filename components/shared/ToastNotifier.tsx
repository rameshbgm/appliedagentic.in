'use client'
// components/shared/ToastNotifier.tsx
import { Toaster } from 'sonner'

export default function ToastNotifier() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          border: '1px solid var(--bg-border)',
          fontFamily: 'Inter, sans-serif',
        },
        classNames: {
          success: 'border-l-4 border-l-green-500',
          error: 'border-l-4 border-l-red-500',
          info: 'border-l-4 border-l-blue-500',
          warning: 'border-l-4 border-l-yellow-500',
        },
      }}
    />
  )
}
