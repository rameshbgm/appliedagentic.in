'use client'
// components/shared/ArticleLoadingContext.tsx
// Shows the "Departing" indicator while a client-side navigation is in flight.
// Internal link clicks are picked up automatically; showLoading() is still
// exported for programmatic navigation.
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import ArticleLoadingModal from './ArticleLoadingModal'

interface ArticleLoadingContextValue {
  showLoading: (targetHref?: string) => void
  isLoading: boolean
}

const ArticleLoadingContext = createContext<ArticleLoadingContextValue>({
  showLoading: () => {},
  isLoading: false,
})

const norm = (s: string) => s.split('?')[0].split('#')[0].replace(/\/$/, '') || '/'

export function ArticleLoadingProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [completing, setCompleting] = useState(false)
  const pathname = usePathname()
  const pathRef = useRef(pathname)
  const activeRef = useRef(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = [] }

  const hide = useCallback(() => {
    if (!activeRef.current) return
    activeRef.current = false
    clearTimers()
    setCompleting(true)
    timers.current.push(setTimeout(() => { setVisible(false); setCompleting(false) }, 380))
  }, [])

  const showLoading = useCallback((targetHref?: string) => {
    if (targetHref && norm(targetHref) === norm(pathRef.current)) return
    clearTimers()
    activeRef.current = true
    setCompleting(false)
    setVisible(true)
    // Safety net if the navigation never completes
    timers.current.push(setTimeout(hide, 12000))
  }, [hide])

  // Navigation finished
  useEffect(() => {
    pathRef.current = pathname
    hide()
  }, [pathname, hide])

  // Catch plain internal link clicks anywhere on the page
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as HTMLElement | null)?.closest?.('a')
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return
      const href = a.getAttribute('href')
      if (!href || !href.startsWith('/') || href.startsWith('//')) return
      if (/\.(html?|pdf|xml|txt)$/i.test(href.split('?')[0])) return
      showLoading(href)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [showLoading])

  return (
    <ArticleLoadingContext.Provider value={{ showLoading, isLoading: visible }}>
      {children}
      {visible && <ArticleLoadingModal completing={completing} />}
    </ArticleLoadingContext.Provider>
  )
}

export function useArticleLoading() {
  return useContext(ArticleLoadingContext)
}
