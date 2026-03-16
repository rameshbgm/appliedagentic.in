'use client'
// components/public/ArticleAudioPlayer.tsx
// Fixed bottom audio player — reads all state from ArticleAudioContext.
import { useState, useRef, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, X, SkipBack, SkipForward, Loader2, RotateCcw, RotateCw } from 'lucide-react'
import { useArticleAudio } from './ArticleAudioContext'

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

const fmt = (s: number) => {
  if (!isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function ArticleAudioPlayer() {
  const {
    playState, currentSectionIdx, progress, currentTime, duration,
    speed, muted, visible, sections,
    togglePlayPause, seek, setSpeed, toggleMute, goToSection, close,
  } = useArticleAudio()

  const barRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const [showSpeed, setShowSpeed] = useState(false)

  // Check if any section has audio
  const hasAudio = sections.some((s) => s.audioUrl)
  if (!visible || !hasAudio) return null

  const hasSections = sections.filter((s) => s.audioUrl).length > 1
  const currentTitle = currentSectionIdx !== null
    ? sections[currentSectionIdx]?.title || 'Untitled'
    : ''

  // ── Scrub helpers ──
  const fractionFromEvent = (clientX: number) => {
    const bar = barRef.current
    if (!bar) return 0
    const rect = bar.getBoundingClientRect()
    return (clientX - rect.left) / rect.width
  }

  const seekFromClientX = (clientX: number) => {
    seek(fractionFromEvent(clientX))
  }

  const onBarMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    seekFromClientX(e.clientX)
    const onMove = (ev: MouseEvent) => seekFromClientX(ev.clientX)
    const onUp = (ev: MouseEvent) => {
      seekFromClientX(ev.clientX)
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const onBarTouchStart = (e: React.TouchEvent) => {
    dragging.current = true
    seekFromClientX(e.touches[0].clientX)
    const onMove = (ev: TouchEvent) => seekFromClientX(ev.touches[0].clientX)
    const onEnd = (ev: TouchEvent) => {
      seekFromClientX(ev.changedTouches[0].clientX)
      dragging.current = false
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onEnd)
  }

  // Find if we can go prev/next (sections with audio)
  const audioSectionIndices = sections.map((s, i) => s.audioUrl ? i : -1).filter((i) => i >= 0)
  const currentAudioPos = currentSectionIdx !== null ? audioSectionIndices.indexOf(currentSectionIdx) : -1
  const canGoPrev = currentAudioPos > 0
  const canGoNext = currentAudioPos >= 0 && currentAudioPos < audioSectionIndices.length - 1

  const isPlaying = playState === 'playing'
  const isLoading = playState === 'loading'

  const skipSeconds = (delta: number) => {
    if (!duration || !isFinite(duration)) return
    seek(Math.max(0, Math.min(1, (currentTime + delta) / duration)))
  }

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-30 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-2xl rounded-xl px-3 py-2 shadow-2xl"
      style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(108,61,255,0.35)', bottom: 'calc(10px + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* ── Single compact row ── */}
      <div className="flex items-center gap-2">

        {/* Prev section */}
        {hasSections && (
          <button
            type="button"
            onClick={() => goToSection(-1)}
            disabled={!canGoPrev}
            className="shrink-0 p-1.5 rounded-lg transition-opacity disabled:opacity-30 hover:bg-white/10"
            style={{ color: 'var(--text-muted)' }}
            title="Previous section"
          >
            <SkipBack size={13} />
          </button>
        )}

        {/* Rewind 15s */}
        <button
          type="button"
          onClick={() => skipSeconds(-15)}
          disabled={!duration || currentTime <= 0}
          className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg transition-opacity hover:bg-white/10 disabled:opacity-30"
          style={{ color: 'var(--text-muted)' }}
          title="Rewind 15 seconds"
        >
          <RotateCcw size={15} />
        </button>

        {/* Play / Pause / Loading */}
        <button
          type="button"
          onClick={togglePlayPause}
          disabled={isLoading}
          title={isPlaying ? 'Pause' : 'Play'}
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-60 transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6C3DFF, #9B59B6)', color: '#fff', WebkitTapHighlightColor: 'transparent', boxShadow: '0 2px 8px rgba(108,61,255,0.4)' }}
        >
          {isLoading ? <Loader2 size={12} className="animate-spin" /> : isPlaying ? <Pause size={12} /> : <Play size={12} />}
        </button>

        {/* Skip forward 15s */}
        <button
          type="button"
          onClick={() => skipSeconds(15)}
          disabled={!duration || currentTime >= duration}
          className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg transition-opacity hover:bg-white/10 disabled:opacity-30"
          style={{ color: 'var(--text-muted)' }}
          title="Skip forward 15 seconds"
        >
          <RotateCw size={15} />
        </button>

        {/* Next section */}
        {hasSections && (
          <button
            type="button"
            onClick={() => goToSection(1)}
            disabled={!canGoNext}
            className="shrink-0 p-1.5 rounded-lg transition-opacity disabled:opacity-30 hover:bg-white/10"
            style={{ color: 'var(--text-muted)' }}
            title="Next section"
          >
            <SkipForward size={13} />
          </button>
        )}

        {/* Title — hidden on very small screens */}
        {currentTitle && (
          <span
            className="hidden sm:block shrink-0 text-xs font-medium truncate max-w-30"
            style={{ color: 'var(--text-secondary)' }}
            title={currentTitle}
          >
            {currentTitle}
          </span>
        )}

        {/* Current time */}
        <span className="shrink-0 text-xs tabular-nums" style={{ color: 'var(--text-muted)', minWidth: 32 }}>
          {fmt(currentTime)}
        </span>

        {/* Progress bar — fills remaining space */}
        <div
          ref={barRef}
          className="flex-1 h-7 flex items-center cursor-pointer select-none"
          onMouseDown={onBarMouseDown}
          onTouchStart={onBarTouchStart}
        >
          <div className="relative h-1.5 w-full rounded-full" style={{ background: 'rgba(108,61,255,0.15)' }}>
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #6C3DFF, #9B59B6)' }}
            />
            {/* Scrubber thumb */}
            <div
              className="absolute top-1/2 w-3.5 h-3.5 rounded-full shadow-md"
              style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)', background: '#fff', border: '2px solid #6C3DFF', boxShadow: '0 0 6px rgba(108,61,255,0.5)' }}
            />
          </div>
        </div>

        {/* Duration */}
        <span className="shrink-0 text-xs tabular-nums" style={{ color: 'var(--text-muted)', minWidth: 32 }}>
          {duration ? fmt(duration) : '--:--'}
        </span>

        {/* Speed */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowSpeed((v) => !v)}
            className="px-1.5 py-0.5 rounded text-xs font-semibold border hover:bg-white/10 transition-colors"
            style={{ color: '#6C3DFF', borderColor: 'rgba(108,61,255,0.4)', minWidth: 34 }}
            title="Playback speed"
          >
            {speed}×
          </button>
          {showSpeed && (
            <div
              className="absolute bottom-full mb-1 right-0 rounded-lg border shadow-xl overflow-hidden z-50"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}
            >
              {SPEEDS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => { setSpeed(s); setShowSpeed(false) }}
                  className="block w-full px-3 py-1 text-xs text-left hover:bg-white/10 transition-colors"
                  style={{ color: s === speed ? '#6C3DFF' : 'var(--text-primary)', fontWeight: s === speed ? 700 : 400 }}
                >
                  {s}×
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mute */}
        <button
          type="button"
          onClick={toggleMute}
          title={muted ? 'Unmute' : 'Mute'}
          className="shrink-0 p-1.5 rounded-lg hover:bg-white/10"
          style={{ color: 'var(--text-muted)' }}
        >
          {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>

        {/* Close */}
        <button
          type="button"
          onClick={close}
          title="Close player"
          className="shrink-0 p-1.5 rounded-lg hover:bg-white/10"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}
