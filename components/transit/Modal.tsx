'use client'
import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

let openModals = 0
let previousOverflow = ''

// Native modal dialogs keep keyboard focus inside, make the page inert, and
// restore focus on close. Nested reader/summary sheets use the same lifecycle.
export default function Modal({ label, onClose, children, className = '', theme }: {
  label: string; onClose: () => void; children: ReactNode; className?: string; theme?: 'light' | 'dark'
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useLayoutEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.showModal()
    if (openModals++ === 0) {
      previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    return () => {
      dialog.close()
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
      if (--openModals === 0) document.body.style.overflow = previousOverflow
    }
  }, [])
  if (typeof document === 'undefined') return null
  return createPortal(<dialog ref={ref} className={`tr-overlay ${className}`} data-theme={theme} aria-label={label}
    onCancel={(event) => { event.preventDefault(); onClose() }}
    onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
    {children}
  </dialog>, document.body)
}
