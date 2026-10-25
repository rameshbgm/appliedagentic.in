'use client'
// components/aurora/ListenButton.tsx
// Starts narration from the first section with audio. "toolbar" is an icon
// button for the navigator; "header" is a full button under the title.
import { Headphones, Loader2, Pause, Play } from 'lucide-react'
import { useArticleAudio } from '@/components/public/ArticleAudioContext'

export default function ListenButton({ variant = 'header' }: { variant?: 'header' | 'toolbar' }) {
  const audio = useArticleAudio()
  if (!audio.sections.some((s) => s.audioUrl)) return null
  const { playState } = audio
  const icon = playState === 'loading' ? <Loader2 size={18} className="animate-spin" />
    : playState === 'playing' ? <Pause size={18} /> : playState === 'paused' ? <Play size={18} /> : <Headphones size={18} />
  const label = playState === 'playing' ? 'Pause narration' : playState === 'paused' ? 'Resume narration' : 'Listen to this essay'
  if (variant === 'toolbar') {
    return <button type="button" className="a-icon" aria-pressed={playState === 'playing'} onClick={audio.togglePlayPause} aria-label={label} title={label}>{icon}</button>
  }
  return <button type="button" className="a-btn a-btn--quiet a-btn--sm" onClick={audio.togglePlayPause}>{icon} {label}</button>
}
