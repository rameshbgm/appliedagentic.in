'use client'
// components/public/ArticleAudioContext.tsx
// Shared audio state for the public article page.
// One <audio> element controlled by both SectionCard speaker icons and the bottom ArticleAudioPlayer.

import { createContext, useContext, useRef, useState, useCallback, useEffect, type ReactNode } from 'react'

export interface AudioSection {
  id: number
  title: string
  audioUrl?: string | null
}

export type PlayState = 'idle' | 'loading' | 'playing' | 'paused'

export interface ArticleAudioContextValue {
  playState: PlayState
  currentSectionIdx: number | null
  progress: number        // 0-100
  currentTime: number
  duration: number
  speed: number
  muted: boolean
  visible: boolean
  sections: AudioSection[]

  playSectionAudio: (idx: number) => void
  pause: () => void
  togglePlayPause: () => void
  seek: (fraction: number) => void
  setSpeed: (s: number) => void
  toggleMute: () => void
  goToSection: (dir: 1 | -1) => void
  close: () => void
}

const ArticleAudioContext = createContext<ArticleAudioContextValue | null>(null)

export function useArticleAudio() {
  const ctx = useContext(ArticleAudioContext)
  if (!ctx) throw new Error('useArticleAudio must be used within ArticleAudioProvider')
  return ctx
}

interface ProviderProps {
  sections: AudioSection[]
  children: ReactNode
}

export function ArticleAudioProvider({ sections, children }: ProviderProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  const [playState, setPlayState] = useState<PlayState>('idle')
  const [currentSectionIdx, setCurrentSectionIdx] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeedState] = useState(1)
  const [muted, setMuted] = useState(false)
  const [visible, setVisible] = useState(() => sections.some((s) => s.audioUrl))

  // Keep a ref to sections so callbacks don't go stale
  const sectionsRef = useRef(sections)
  sectionsRef.current = sections

  const currentSectionIdxRef = useRef(currentSectionIdx)
  currentSectionIdxRef.current = currentSectionIdx

  // ── Audio event listeners ──
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      setProgress(isFinite(audio.duration) ? (audio.currentTime / audio.duration) * 100 : 0)
    }
    const onLoadedMetadata = () => {
      setDuration(audio.duration)
    }
    const onCanPlay = () => {
      if (audio.dataset.shouldPlay === 'true') {
        audio.dataset.shouldPlay = ''
        audio.play().then(() => setPlayState('playing')).catch(() => setPlayState('paused'))
      }
    }
    const onEnded = () => {
      // Auto-advance to next section with audio
      const secs = sectionsRef.current
      const idx = currentSectionIdxRef.current
      if (idx === null) { setPlayState('idle'); return }
      let next = -1
      for (let i = idx + 1; i < secs.length; i++) {
        if (secs[i].audioUrl) { next = i; break }
      }
      if (next >= 0) {
        loadAndPlay(next)
        // Scroll to section
        const el = document.getElementById(`section-${next + 1}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        setPlayState('idle')
      }
    }
    const onError = () => {
      setPlayState('idle')
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('canplay', onCanPlay)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('canplay', onCanPlay)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Internal: load a section's audio and auto-play
  const loadAndPlay = useCallback((idx: number) => {
    const audio = audioRef.current
    const section = sectionsRef.current[idx]
    if (!audio || !section?.audioUrl) return

    setCurrentSectionIdx(idx)
    setPlayState('loading')
    setProgress(0)
    setCurrentTime(0)
    setDuration(0)
    setVisible(true)

    audio.dataset.shouldPlay = 'true'
    audio.src = section.audioUrl
    audio.playbackRate = speed
    audio.load()
  }, [speed])

  const playSectionAudio = useCallback((idx: number) => {
    loadAndPlay(idx)
  }, [loadAndPlay])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setPlayState('paused')
  }, [])

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playState === 'playing') {
      audio.pause()
      setPlayState('paused')
    } else if (playState === 'paused') {
      audio.play().then(() => setPlayState('playing')).catch(() => {})
    } else if (playState === 'idle') {
      if (currentSectionIdx !== null) {
        audio.play().then(() => setPlayState('playing')).catch(() => {})
      } else {
        // Nothing selected yet — start from first section with audio
        const firstIdx = sectionsRef.current.findIndex((s) => s.audioUrl)
        if (firstIdx >= 0) loadAndPlay(firstIdx)
      }
    }
  }, [playState, currentSectionIdx, loadAndPlay])

  const seek = useCallback((fraction: number) => {
    const audio = audioRef.current
    if (!audio || !isFinite(audio.duration)) return
    const clamped = Math.max(0, Math.min(1, fraction))
    audio.currentTime = clamped * audio.duration
    setCurrentTime(audio.currentTime)
    setProgress(clamped * 100)
  }, [])

  const setSpeed = useCallback((s: number) => {
    setSpeedState(s)
    if (audioRef.current) audioRef.current.playbackRate = s
  }, [])

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      if (audioRef.current) audioRef.current.muted = !prev
      return !prev
    })
  }, [])

  const goToSection = useCallback((dir: 1 | -1) => {
    const secs = sectionsRef.current
    const idx = currentSectionIdxRef.current ?? (dir === 1 ? -1 : secs.length)
    let next = -1
    if (dir === 1) {
      for (let i = idx + 1; i < secs.length; i++) {
        if (secs[i].audioUrl) { next = i; break }
      }
    } else {
      for (let i = idx - 1; i >= 0; i--) {
        if (secs[i].audioUrl) { next = i; break }
      }
    }
    if (next >= 0) {
      loadAndPlay(next)
      const el = document.getElementById(`section-${next + 1}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [loadAndPlay])

  const close = useCallback(() => {
    audioRef.current?.pause()
    setVisible(false)
    setPlayState('idle')
    setCurrentSectionIdx(null)
    setProgress(0)
    setCurrentTime(0)
    setDuration(0)
  }, [])

  const value: ArticleAudioContextValue = {
    playState,
    currentSectionIdx,
    progress,
    currentTime,
    duration,
    speed,
    muted,
    visible,
    sections,
    playSectionAudio,
    pause,
    togglePlayPause,
    seek,
    setSpeed,
    toggleMute,
    goToSection,
    close,
  }

  return (
    <ArticleAudioContext.Provider value={value}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} preload="none" />
      {children}
    </ArticleAudioContext.Provider>
  )
}
