'use client'
// components/admin/editor/ArticleSectionEditor.tsx
import { useRef } from 'react'
import dynamic from 'next/dynamic'
import { ChevronUp, ChevronDown, Trash2, GripVertical } from 'lucide-react'
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
  onAudioGenerated?: (url: string) => void
}

export default function ArticleSectionEditor({
  section, index, total, articleId,
  onChange, onDelete, onMoveUp, onMoveDown, onAudioGenerated,
}: Props) {
  const insertRef = useRef<(md: string) => void>(() => {})
  const replaceRef = useRef<(md: string) => void>(() => {})

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all"
      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}
    >
      {/* AI Assist Panel — sits above everything */}
      <AIAssistPanel
        onInsert={(md) => insertRef.current(md)}
        onReplace={(md) => replaceRef.current(md)}
        articleId={articleId}
        onAudioGenerated={onAudioGenerated}
      />
      {/* Section header bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)' }}
      >
        {/* Drag handle (visual only) */}
        <GripVertical size={14} className="shrink-0 cursor-grab opacity-40" style={{ color: 'var(--text-muted)' }} />

        {/* Section number badge */}
        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0"
          style={{ background: 'var(--color-violet)', color: '#fff' }}
        >
          {index + 1}
        </span>

        {/* Section title input */}
        <input
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          placeholder={`Section ${index + 1} title (optional)…`}
          className="flex-1 bg-transparent outline-none text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        />

        {/* Controls */}
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
        onInsertRef={(fn) => { insertRef.current = fn }}
        onReplaceRef={(fn) => { replaceRef.current = fn }}
      />
    </div>
  )
}
