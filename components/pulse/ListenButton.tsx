'use client'
// components/pulse/ListenButton.tsx
// Starts narration from the first section that has audio. "cover" sits in the
// article header; "pill" sits inside the floating pill nav.
import { Headphones, Loader2, Pause, Play } from 'lucide-react'
import { useArticleAudio } from '@/components/public/ArticleAudioContext'

export default function ListenButton({ variant = 'cover' }: { variant?: 'cover' | 'pill' }) {
  const audio = useArticleAudio()
  if (!audio.sections.some((s) => s.audioUrl)) return null
  const { playState } = audio
  const icon = playState === 'loading'
    ? <Loader2 size={18} className="animate-spin" />
    : playState === 'playing' ? <Pause size={18} /> : playState === 'paused' ? <Play size={18} /> : <Headphones size={18} />
  const label = playState === 'playing' ? 'Pause' : playState === 'paused' ? 'Resume' : 'Listen'

  if (variant === 'pill') {
    return (
      <button type="button" onClick={audio.togglePlayPause} aria-label={`${label} narration`}>
        {icon}<span>{label}</span>
      </button>
    )
  }
  return (
    <button type="button" className="p-btn" onClick={audio.togglePlayPause}>
      {icon} {playState === 'idle' ? 'Listen to this lesson' : `${label} narration`}
    </button>
  )
}
