'use client'
// components/shared/ArticleLoadingContext.tsx
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import ArticleLoadingModal from './ArticleLoadingModal'

interface ArticleLoadingContextValue {
  showLoading: () => void
  isLoading: boolean
}

const ArticleLoadingContext = createContext<ArticleLoadingContextValue>({
  showLoading: () => {},
  isLoading: false,
})

export function ArticleLoadingProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [completing, setCompleting] = useState(false)
  const pathname = usePathname()

  const prevPathRef  = useRef<string | null>(null)
  const startedAtRef = useRef<number>(0)
  const activeRef    = useRef(false)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = () => {
    if (hideTimerRef.current)   { clearTimeout(hideTimerRef.current);   hideTimerRef.current   = null }
    if (safetyTimerRef.current) { clearTimeout(safetyTimerRef.current); safetyTimerRef.current = null }
  }

  const doHide = useCallback(() => {
    if (!activeRef.current) return
    activeRef.current = false
    if (hideTimerRef.current)   { clearTimeout(hideTimerRef.current);   hideTimerRef.current   = null }
    if (safetyTimerRef.current) { clearTimeout(safetyTimerRef.current); safetyTimerRef.current = null }

    // Honour a minimum display time of 900ms so the modal doesn't flash
    const elapsed  = Date.now() - startedAtRef.current
    const minDelay = Math.max(0, 900 - elapsed)

    setTimeout(() => {
      setCompleting(true)
      hideTimerRef.current = setTimeout(() => {
        setVisible(false)
        setCompleting(false)
      }, 1000)
    }, minDelay)
  }, [])

  const showLoading = useCallback(() => {
    clearTimers()
    prevPathRef.current  = pathname
    startedAtRef.current = Date.now()
    activeRef.current    = true
    setCompleting(false)
    setVisible(true)
    // Safety: force-hide after 15s if navigation never completes
    safetyTimerRef.current = setTimeout(doHide, 15000)
  }, [pathname, doHide])

  // Listen for pathname changes → navigation complete → start hide
  useEffect(() => {
    if (!activeRef.current) return
    if (prevPathRef.current !== null && pathname !== prevPathRef.current) {
      doHide()
    }
  }, [pathname, doHide])

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
