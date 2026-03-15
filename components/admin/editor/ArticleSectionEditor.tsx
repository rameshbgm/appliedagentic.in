'use client'
// components/admin/editor/ArticleSectionEditor.tsx
import { useRef, useCallback, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ChevronUp, ChevronDown, Trash2, GripVertical, Headphones, X, Play, Pause, Save, Loader2 } from 'lucide-react'
import AIAssistPanel from './AIAssistPanel'

const MarkdownEditor = dynamic(() => import('./MarkdownEditor'), {
  ssr: false,
  loading: () => <div className="h-64 rounded-2xl skeleton" />,
})

export interface SectionData {
  tempId: string   // client-side stable key (never sent to API)
  id?: number      // DB id once saved
  title: string
  content: string
  audioUrl?: string | null
  audioStale?: boolean  // true when content changed after audio was generated
  order: number
}

interface Props {
  section: SectionData
  index: number
  total: number
  articleId?: number
  onChange: (updated: SectionData) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onAudioGenerated?: (url: string | null) => void
  onSave?: () => void
  isSaving?: boolean
  isDirty?: boolean
}

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function SectionAudioPreview({ url, onRemove }: { url: string; onRemove: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const barRef   = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const [playing,  setPlaying]  = useState(false)
  const [current,  setCurrent]  = useState(0)
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => {
      if (dragging.current) return
      setCurrent(audio.currentTime)
      setProgress(isFinite(audio.duration) ? (audio.currentTime / audio.duration) * 100 : 0)
    }
    const onMeta = () => setDuration(audio.duration)
    const onEnd  = () => setPlaying(false)
    audio.addEventListener('timeupdate',     onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended',          onEnd)
    return () => {
      audio.removeEventListener('timeupdate',     onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended',          onEnd)
    }
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { audio.play(); setPlaying(true) }
  }

  const seekTo = (clientX: number) => {
    const audio = audioRef.current
    const bar   = barRef.current
    if (!audio || !bar || !isFinite(audio.duration)) return
    const rect = bar.getBoundingClientRect()
    const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    audio.currentTime = frac * audio.duration
    setCurrent(audio.currentTime)
    setProgress(frac * 100)
  }

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    seekTo(e.clientX)
    const onMove = (ev: MouseEvent) => seekTo(ev.clientX)
    const onUp   = (ev: MouseEvent) => {
      seekTo(ev.clientX)
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 border-b"
      style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)' }}
    >
      {/* preload="metadata" fetches just enough to get duration on mount */}
      <audio ref={audioRef} src={url} preload="metadata" />

      <Headphones size={12} style={{ color: '#22c55e', flexShrink: 0 }} />

      <button
        type="button"
        onClick={toggle}
        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white"
        style={{ background: '#22c55e' }}
      >
        {playing ? <Pause size={10} /> : <Play size={10} />}
      </button>

      <span className="shrink-0 text-xs tabular-nums" style={{ color: 'var(--text-muted)', minWidth: 28, fontSize: 11 }}>
        {fmt(current)}
      </span>

      {/* Progress bar */}
      <div
        ref={barRef}
        className="flex-1 h-6 flex items-center cursor-pointer select-none"
        onMouseDown={onMouseDown}
      >
        <div className="relative h-1 w-full rounded-full" style={{ background: 'var(--bg-border)' }}>
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${progress}%`, background: '#22c55e' }}
          />
          <div
            className="absolute w-2.5 h-2.5 rounded-full border-2"
            style={{
              left: `${progress}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#fff',
              borderColor: '#22c55e',
            }}
          />
        </div>
      </div>

      <span className="shrink-0 text-xs tabular-nums" style={{ color: 'var(--text-muted)', minWidth: 28, fontSize: 11 }}>
        {duration ? fmt(duration) : '--:--'}
      </span>

      <button
        type="button"
        onClick={onRemove}
        title="Remove audio"
        className="shrink-0 p-1 rounded hover:bg-red-50 transition-colors"
        style={{ color: '#ef4444' }}
      >
        <X size={11} />
      </button>
    </div>
  )
}

export default function ArticleSectionEditor({
  section, index, total, articleId,
  onChange, onDelete, onMoveUp, onMoveDown, onAudioGenerated,
  onSave, isSaving, isDirty,
}: Props) {
  const insertRef = useRef<(md: string) => void>(() => {})
  const replaceRef = useRef<(md: string) => void>(() => {})

  const onInsertRef = useCallback((fn: (md: string) => void) => {
    insertRef.current = fn
  }, [])
  const onReplaceRef = useCallback((fn: (md: string) => void) => {
    replaceRef.current = fn
  }, [])

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all"
      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}
    >
      {/* AI Assist Panel */}
      <AIAssistPanel
        onInsert={(md) => insertRef.current(md)}
        onReplace={(md) => replaceRef.current(md)}
        onSetTitle={(title) => onChange({ ...section, title })}
        articleId={articleId}
        sectionId={section.id}
        sectionContent={section.content}
        onAudioGenerated={onAudioGenerated}
      />

      {/* Section header bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)' }}
      >
        <GripVertical size={14} className="shrink-0 cursor-grab opacity-40" style={{ color: 'var(--text-muted)' }} />

        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0"
          style={{ background: 'var(--color-violet)', color: '#fff' }}
        >
          {index + 1}
        </span>

        <input
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          placeholder={`Section ${index + 1} title (optional)…`}
          className="flex-1 bg-transparent outline-none text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        />

        {/* Stale audio warning */}
        {section.audioUrl && section.audioStale && (
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium shrink-0"
            style={{ background: 'rgba(245,158,11,0.12)', color: '#d97706' }}
            title="Content changed — audio is out of sync"
          >
            <Headphones size={11} />
            Out of sync
          </span>
        )}

        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            title="Save this section"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium disabled:opacity-50 transition-all shrink-0"
            style={{
              background: isDirty ? 'var(--color-violet)' : 'var(--bg-surface)',
              color: isDirty ? '#fff' : 'var(--text-muted)',
              border: isDirty ? 'none' : '1px solid var(--bg-border)',
            }}
          >
            {isSaving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
            Save
          </button>
        )}

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            title="Move section up"
            className="inline-flex items-center justify-center w-6 h-6 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <ChevronUp size={13} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            title="Move section down"
            className="inline-flex items-center justify-center w-6 h-6 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <ChevronDown size={13} />
          </button>
          {total > 1 && (
            <button
              type="button"
              onClick={onDelete}
              title="Delete section"
              className="inline-flex items-center justify-center w-6 h-6 rounded-md hover:bg-red-50 transition-colors ml-0.5"
              style={{ color: '#ef4444' }}
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <MarkdownEditor
        content={section.content}
        onChange={(md) => onChange({ ...section, content: md })}
        onInsertRef={onInsertRef}
        onReplaceRef={onReplaceRef}
      />

      {/* Audio preview — shown in footer when section has audio */}
      {section.audioUrl && (
        <SectionAudioPreview
          url={section.audioUrl}
          onRemove={() => onChange({ ...section, audioUrl: undefined })}
        />
      )}
    </div>
  )
}
