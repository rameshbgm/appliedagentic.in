'use client'
// components/admin/editor/MarkdownEditor.tsx
import { useCallback, useState } from 'react'
import dynamic from 'next/dynamic'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface MarkdownEditorProps {
  content: string
  onChange: (md: string) => void
  onInsertRef?: (fn: (md: string) => void) => void
  onReplaceRef?: (fn: (md: string) => void) => void
}

function countWords(md: string): { words: number; chars: number } {
  const plain = md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>]+/g, '')
  const words = plain.trim().split(/\s+/).filter(Boolean).length
  const chars = md.length
  return { words, chars }
}

export default function MarkdownEditor({ content, onChange, onInsertRef, onReplaceRef }: MarkdownEditorProps) {
  const [value, setValue] = useState(content)

  const handleChange = useCallback((val: string | undefined) => {
    const md = val ?? ''
    setValue(md)
    onChange(md)
  }, [onChange])

  const insertContent = useCallback((md: string) => {
    setValue((prev) => {
      const next = prev ? `${prev}\n\n${md}` : md
      onChange(next)
      return next
    })
  }, [onChange])

  const replaceContent = useCallback((md: string) => {
    setValue(md)
    onChange(md)
  }, [onChange])

  if (onInsertRef) onInsertRef(insertContent)
  if (onReplaceRef) onReplaceRef(replaceContent)

  const { words, chars } = countWords(value)

  return (
    <div className="flex flex-col" style={{ borderColor: 'var(--bg-border)' }}>
      <div data-color-mode="light" style={{ background: 'var(--bg-surface)' }}>
        <MDEditor
          value={value}
          onChange={handleChange}
          preview="live"
          height={480}
          style={{ borderRadius: 0, border: 'none', boxShadow: 'none', fontSize: 14 }}
          textareaProps={{ placeholder: 'Start writing your article in Markdown…' }}
        />
      </div>
      <div
        className="flex items-center gap-4 px-4 py-1.5 border-t text-xs"
        style={{ borderColor: 'var(--bg-border)', color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}
      >
        <span>{words.toLocaleString()} words</span>
        <span>{chars.toLocaleString()} chars</span>
      </div>
    </div>
  )
}
