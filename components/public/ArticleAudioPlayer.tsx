'use client'
// components/public/ArticleAudioPlayer.tsx
import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, X, SkipBack, SkipForward } from 'lucide-react'

interface Props {
  audioUrl: string
  title: string
  sections?: { id: number; title: string }[]
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

const fmt = (s: number) => {
  if (!isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function ArticleAudioPlayer({ audioUrl, title, sections = [] }: Props) {
  const audioRef    = useRef<HTMLAudioElement>(null)
  const barRef      = useRef<HTMLDivElement>(null)
  const dragging    = useRef(false)

  const [playing,     setPlaying]     = useState(false)
  const [progress,    setProgress]    = useState(0)   // 0–100
  const [currentTime, setCurrentTime] = useState(0)
  const [duration,    setDuration]    = useState(0)
  const [muted,       setMuted]       = useState(false)
  const [speed,       setSpeed]       = useState(1)
  const [showSpeed,   setShowSpeed]   = useState(false)
  const [visible,     setVisible]     = useState(true)
  const [sectionIdx,  setSectionIdx]  = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime  = () => {
      if (!dragging.current) {
        setCurrentTime(audio.currentTime)
        setProgress(isFinite(audio.duration) ? (audio.currentTime / audio.duration) * 100 : 0)
      }
    }
    const onMeta  = () => setDuration(audio.duration)
    const onEnd   = () => setPlaying(false)
    audio.addEventListener('timeupdate',    onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended',         onEnd)
    return () => {
      audio.removeEventListener('timeupdate',    onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended',         onEnd)
    }
  }, [])

  // Sync speed to audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed
  }, [speed])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { audio.play(); setPlaying(true) }
  }

  // Shared seek-by-fraction logic
  const seekToFraction = useCallback((fraction: number) => {
    const audio = audioRef.current
    if (!audio || !isFinite(audio.duration)) return
    const clamped = Math.max(0, Math.min(1, fraction))
    audio.currentTime = clamped * audio.duration
    setCurrentTime(audio.currentTime)
    setProgress(clamped * 100)
  }, [])

  const fractionFromEvent = (clientX: number) => {
    const bar = barRef.current
    if (!bar) return 0
    const rect = bar.getBoundingClientRect()
    return (clientX - rect.left) / rect.width
  }

  // Mouse events for click + drag on progress bar
  const onBarMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    seekToFraction(fractionFromEvent(e.clientX))
    const onMove = (ev: MouseEvent) => seekToFraction(fractionFromEvent(ev.clientX))
    const onUp   = (ev: MouseEvent) => { seekToFraction(fractionFromEvent(ev.clientX)); dragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
  }

  // Touch events for mobile scrubbing
  const onBarTouchStart = (e: React.TouchEvent) => {
    dragging.current = true
    seekToFraction(fractionFromEvent(e.touches[0].clientX))
    const onMove = (ev: TouchEvent) => seekToFraction(fractionFromEvent(ev.touches[0].clientX))
    const onEnd  = (ev: TouchEvent) => { seekToFraction(fractionFromEvent(ev.changedTouches[0].clientX)); dragging.current = false; window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd) }
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend',  onEnd)
  }

  const goToSection = (dir: 1 | -1) => {
    const next = Math.max(0, Math.min(sections.length - 1, sectionIdx + dir))
    setSectionIdx(next)
    const el = document.getElementById(`section-${next + 1}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cycleSpeed = () => {
    const idx = SPEEDS.indexOf(speed)
    const next = SPEEDS[(idx + 1) % SPEEDS.length]
    setSpeed(next)
  }

  if (!visible) return null

  const hasSections = sections.length > 1

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-30 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-2xl rounded-xl px-3 py-2 shadow-2xl"
      style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(108,61,255,0.35)', bottom: 'calc(10px + env(safe-area-inset-bottom, 0px))' }}
    >
      <audio ref={audioRef} src={audioUrl} />

      {/* ── Single compact row ── */}
      <div className="flex items-center gap-2">

        {/* Prev section */}
        {hasSections && (
          <button
            type="button"
            onClick={() => goToSection(-1)}
            disabled={sectionIdx === 0}
            className="shrink-0 p-1.5 rounded-lg transition-opacity disabled:opacity-30 hover:bg-white/10"
            style={{ color: 'var(--text-muted)' }}
            title="Previous section"
          >
            <SkipBack size={13} />
          </button>
        )}

        {/* Play / Pause */}
        <button
          onClick={toggle}
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: 'var(--green)', color: '#fff', WebkitTapHighlightColor: 'transparent' }}
        >
          {playing ? <Pause size={12} /> : <Play size={12} />}
        </button>

        {/* Next section */}
        {hasSections && (
          <button
            type="button"
            onClick={() => goToSection(1)}
            disabled={sectionIdx === sections.length - 1}
            className="shrink-0 p-1.5 rounded-lg transition-opacity disabled:opacity-30 hover:bg-white/10"
            style={{ color: 'var(--text-muted)' }}
            title="Next section"
          >
            <SkipForward size={13} />
          </button>
        )}

        {/* Title — hidden on very small screens */}
        <span
          className="hidden sm:block shrink-0 text-xs font-medium truncate max-w-30"
          style={{ color: 'var(--text-secondary)' }}
          title={title}
        >
          🎧 {title}
        </span>

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
          <div className="relative h-1 w-full rounded-full" style={{ background: 'var(--bg-border)' }}>
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${progress}%`, background: 'var(--green)' }}
            />
            {/* Scrubber thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 shadow"
              style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)', background: '#fff', borderColor: 'var(--green)' }}
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
            className="px-1.5 py-0.5 rounded text-xs font-semibold border hover:bg-white/10"
            style={{ color: 'var(--text-secondary)', borderColor: 'var(--bg-border)', minWidth: 34 }}
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
                  style={{ color: s === speed ? 'var(--green)' : 'var(--text-primary)', fontWeight: s === speed ? 700 : 400 }}
                >
                  {s}×
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mute */}
        <button
          onClick={() => { setMuted((v) => !v); if (audioRef.current) audioRef.current.muted = !muted }}
          className="shrink-0 p-1.5 rounded-lg hover:bg-white/10"
          style={{ color: 'var(--text-muted)' }}
        >
          {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>

        {/* Close */}
        <button
          onClick={() => { setVisible(false); audioRef.current?.pause() }}
          className="shrink-0 p-1.5 rounded-lg hover:bg-white/10"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}
