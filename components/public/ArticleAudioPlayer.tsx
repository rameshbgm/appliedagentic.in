'use client'
// components/public/ArticleAudioPlayer.tsx
// Floating narration player — sits above the pill nav, reads all state from ArticleAudioContext.
import { useRef, useState } from 'react'
import { Loader2, Pause, Play, RotateCcw, RotateCw, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react'
import { useArticleAudio } from './ArticleAudioContext'

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2]

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) return '0:00'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

export default function ArticleAudioPlayer() {
  const {
    playState, currentSectionIdx, progress, currentTime, duration,
    speed, muted, visible, sections,
    togglePlayPause, seek, setSpeed, toggleMute, goToSection, close,
  } = useArticleAudio()
  const barRef = useRef<HTMLDivElement>(null)
  const [showSpeed, setShowSpeed] = useState(false)

  if (!visible || !sections.some((s) => s.audioUrl)) return null

  const audioIdx = sections.map((s, i) => (s.audioUrl ? i : -1)).filter((i) => i >= 0)
  const pos = currentSectionIdx !== null ? audioIdx.indexOf(currentSectionIdx) : -1
  const multi = audioIdx.length > 1
  const title = currentSectionIdx !== null ? sections[currentSectionIdx]?.title || 'Narration' : 'Narration'
  const isPlaying = playState === 'playing'
  const isLoading = playState === 'loading'

  const seekFromX = (clientX: number) => {
    const rect = barRef.current?.getBoundingClientRect()
    if (rect) seek((clientX - rect.left) / rect.width)
  }
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    seekFromX(e.clientX)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) seekFromX(e.clientX)
  }
  const skip = (delta: number) => {
    if (duration && isFinite(duration)) seek((currentTime + delta) / duration)
  }

  return (
    <div className="a-audio" role="region" aria-label="Audio narration">
      <div className="a-audio__row">
        <button type="button" className="a-audio__play" onClick={togglePlayPause} disabled={isLoading} aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <div className="a-audio__title">
          <small>
            {multi && pos >= 0 ? `Section ${pos + 1} of ${audioIdx.length}` : 'Now playing'}
            {isPlaying && <span aria-hidden="true"> · playing</span>}
          </small>
          <b title={title}>{title}</b>
        </div>
        {multi && (
          <button type="button" className="a-audio__btn" onClick={() => goToSection(-1)} disabled={pos <= 0} aria-label="Previous section"><SkipBack size={16} /></button>
        )}
        <button type="button" className="a-audio__btn skip" onClick={() => skip(-15)} disabled={!duration} aria-label="Back 15 seconds"><RotateCcw size={16} /></button>
        <button type="button" className="a-audio__btn skip" onClick={() => skip(15)} disabled={!duration} aria-label="Forward 15 seconds"><RotateCw size={16} /></button>
        {multi && (
          <button type="button" className="a-audio__btn" onClick={() => goToSection(1)} disabled={pos < 0 || pos >= audioIdx.length - 1} aria-label="Next section"><SkipForward size={16} /></button>
        )}
        <button type="button" className="a-audio__btn" onClick={close} aria-label="Close player"><X size={16} /></button>
      </div>
      <div className="a-audio__scrub">
        <span>{fmt(currentTime)}</span>
        <div
          ref={barRef}
          className="a-audio__bar"
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onKeyDown={(e) => { if (e.key === 'ArrowRight') skip(5); if (e.key === 'ArrowLeft') skip(-5) }}
        >
          <div>
            <span style={{ width: `${progress}%` }} />
            <i style={{ left: `${progress}%` }} />
          </div>
        </div>
        <span>{duration ? fmt(duration) : '--:--'}</span>
        <div className="a-audio__speed">
          <button type="button" onClick={() => setShowSpeed((v) => !v)} aria-expanded={showSpeed} aria-label="Playback speed">{speed}×</button>
          {showSpeed && (
            <ul>
              {SPEEDS.map((s) => (
                <li key={s}>
                  <button type="button" aria-pressed={s === speed} onClick={() => { setSpeed(s); setShowSpeed(false) }}>{s}×</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="button" className="a-audio__btn" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    </div>
  )
}
