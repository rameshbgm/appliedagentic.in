'use client'
// components/admin/editor/MarkdownEditor.tsx
import { useCallback, useEffect, useRef, useState } from 'react'
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
  // Keep a ref so insertContent/replaceContent can read the latest value
  // without creating stale closures and without calling setState inside a state update.
  const valueRef = useRef(value)

  const handleChange = useCallback((val: string | undefined) => {
    const md = val ?? ''
    valueRef.current = md
    setValue(md)
    onChange(md)
  }, [onChange])

  // Fix: compute next value first, then call setValue + onChange separately.
  // This avoids calling onChange() inside a setValue functional updater, which
  // was causing "setState in render" warnings because it triggered parent state
  // updates while React was still processing our own state transition.
  const insertContent = useCallback((md: string) => {
    const next = valueRef.current ? `${valueRef.current}\n\n${md}` : md
    valueRef.current = next
    setValue(next)
    onChange(next)
  }, [onChange])

  const replaceContent = useCallback((md: string) => {
    valueRef.current = md
    setValue(md)
    onChange(md)
  }, [onChange])

  // Register insert/replace callbacks via useEffect so they are never called
  // during the render phase — only after the component has committed to the DOM.
  useEffect(() => {
    if (onInsertRef) onInsertRef(insertContent)
  }, [onInsertRef, insertContent])

  useEffect(() => {
    if (onReplaceRef) onReplaceRef(replaceContent)
  }, [onReplaceRef, replaceContent])

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
