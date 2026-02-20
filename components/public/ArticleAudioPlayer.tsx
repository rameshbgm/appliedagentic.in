'use client'
// components/public/ArticleAudioPlayer.tsx
import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react'

interface Props {
  audioUrl: string
  title: string
}

export default function ArticleAudioPlayer({ audioUrl, title }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [visible, setVisible] = useState(true)

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const handleUpdate = () => setProgress((audio.currentTime / audio.duration) * 100)
    const handleLoad = () => setDuration(audio.duration)
    const handleEnd = () => setPlaying(false)
    audio.addEventListener('timeupdate', handleUpdate)
    audio.addEventListener('loadedmetadata', handleLoad)
    audio.addEventListener('ended', handleEnd)
    return () => {
      audio.removeEventListener('timeupdate', handleUpdate)
      audio.removeEventListener('loadedmetadata', handleLoad)
      audio.removeEventListener('ended', handleEnd)
    }
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { audio.play(); setPlaying(true) }
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const rect = e.currentTarget.getBoundingClientRect()
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg mx-4 rounded-2xl px-5 py-4 shadow-2xl"
      style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(108,61,255,0.4)' }}
    >
      <audio ref={audioRef} src={audioUrl} />

      <div className="flex items-center gap-4">
        {/* Play/Pause */}
        <button
          onClick={toggle}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white"
          style={{ background: 'var(--green)', color: '#000' }}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate mb-1.5" style={{ color: 'var(--text-primary)' }}>
            🎧 {title}
          </p>
          {/* Progress bar */}
          <div
            className="h-1.5 rounded-full cursor-pointer relative"
            style={{ background: 'var(--bg-border)' }}
            onClick={seek}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${progress}%`, background: 'var(--green)' }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            <span>{audioRef.current ? fmt(audioRef.current.currentTime) : '0:00'}</span>
            <span>{duration ? fmt(duration) : '--:--'}</span>
          </div>
        </div>

        <button
          onClick={() => { setMuted((v) => !v); if (audioRef.current) audioRef.current.muted = !muted }}
          className="p-1.5 rounded-lg hover:bg-white/10"
          style={{ color: 'var(--text-muted)' }}
        >
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
        <button
          onClick={() => { setVisible(false); if (audioRef.current) { audioRef.current.pause() } }}
          className="p-1.5 rounded-lg hover:bg-white/10"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
