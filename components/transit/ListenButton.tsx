'use client'
// components/transit/ListenButton.tsx
// "Listen on board" — starts narration from the first section that has audio.
import { Headphones, Loader2, Pause, Play } from 'lucide-react'
import { useArticleAudio } from '@/components/public/ArticleAudioContext'

export default function ListenButton() {
  const audio = useArticleAudio()
  if (!audio.sections.some((s) => s.audioUrl)) return null
  const { playState } = audio
  return (
    <button type="button" className="tr-btn tr-btn--line" disabled={playState === 'loading'} onClick={audio.togglePlayPause} aria-live="polite">
      {playState === 'loading' ? <Loader2 size={17} className="animate-spin" /> : playState === 'playing' ? <Pause size={17} /> : playState === 'paused' ? <Play size={17} /> : <Headphones size={17} />}
      {playState === 'playing' ? 'Pause narration' : playState === 'paused' ? 'Resume narration' : 'Listen on board'}
    </button>
  )
}
