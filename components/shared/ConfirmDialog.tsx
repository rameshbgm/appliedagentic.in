'use client'
// components/shared/ConfirmDialog.tsx
import { Fragment } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null

  const variantColors = {
    danger: 'bg-red-500/10 text-red-400 border-red-500/30',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  }

  const btnColors = {
    danger: 'var(--l1)',
    warning: 'var(--l4)',
    info: 'var(--l2)',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative w-full max-w-md rounded-[22px] p-6 shadow-2xl"
        style={{ background: 'var(--card)', border: '1px solid var(--rule)' }}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 tr-icon-btn"
        >
          <X size={16} style={{ color: 'var(--text-muted)' }} />
        </button>

        <div className={`inline-flex p-3 rounded-xl border mb-4 ${variantColors[variant]}`}>
          <AlertTriangle size={20} />
        </div>

        <h3 className="tr-display mb-2" style={{ fontSize: '1.7rem' }}>
          {title}
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="tr-btn tr-btn--ghost tr-btn--sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="tr-btn tr-btn--sm" style={{ background: btnColors[variant], borderColor: 'transparent', color: '#fff' }}
          >
            {loading ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
