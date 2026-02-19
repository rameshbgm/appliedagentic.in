'use client'
// components/admin/editor/ArticleEditor.tsx
import { useEffect, useCallback, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Youtube from '@tiptap/extension-youtube'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import { all, createLowlight } from 'lowlight'
import EditorToolbar from './EditorToolbar'
import AIAssistPanel from './AIAssistPanel'

const lowlight = createLowlight(all)

interface ArticleEditorProps {
  content: string
  onChange: (html: string) => void
  articleId?: number
  onAudioGenerated?: (url: string) => void
}

export default function ArticleEditor({ content, onChange, articleId, onAudioGenerated }: ArticleEditorProps) {
  const [isHtmlMode, setIsHtmlMode] = useState(false)
  const [htmlContent, setHtmlContent] = useState(content)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({ allowBase64: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-violet-400 underline underline-offset-2' },
      }),
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'javascript' }),
      Youtube.configure({ controls: true, nocookie: true }),
      Subscript,
      Superscript,
      CharacterCount,
      Placeholder.configure({ placeholder: 'Start writing your article...' }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
      if (!isHtmlMode) setHtmlContent(html)
    },
    editorProps: {
      attributes: {
        class: 'ProseMirror outline-none min-h-[500px] p-6',
      },
    },
  })

  // Sync external content changes (e.g., AI insert)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isHtmlMode) setHtmlContent(content)
  }, [content, isHtmlMode])

  const insertContent = useCallback(
    (html: string) => {
      editor?.chain().focus().insertContent(html).run()
    },
    [editor]
  )

  const replaceContent = useCallback(
    (html: string) => {
      editor?.chain().focus().selectAll().deleteSelection().insertContent(html).run()
    },
    [editor]
  )

  if (!editor) return null

  const chars = editor.storage.characterCount?.characters?.() ?? 0
  const words = editor.storage.characterCount?.words?.() ?? 0

  return (
    <div className="flex flex-col gap-0 rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--bg-border)' }}>
      {/* Toolbar */}
      <EditorToolbar
        editor={editor}
        articleId={articleId}
        isHtmlMode={isHtmlMode}
        onToggleHtmlMode={() => {
          if (isHtmlMode) {
            editor.commands.setContent(htmlContent, false)
            onChange(editor.getHTML())
          } else {
            setHtmlContent(editor.getHTML())
          }
          setIsHtmlMode((prev) => !prev)
        }}
      />

      {/* Content area with AI panel */}
      <div className="relative flex" style={{ background: 'var(--bg-surface)' }}>
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
          {isHtmlMode ? (
            <textarea
              value={htmlContent}
              onChange={(e) => {
                setHtmlContent(e.target.value)
                onChange(e.target.value)
              }}
              className="w-full min-h-[500px] p-6 font-mono text-sm outline-none resize-none"
              style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
            />
          ) : (
            <EditorContent editor={editor} />
          )}
        </div>
        {/* AI Assist Panel floats to the right */}
        <AIAssistPanel
          onInsert={insertContent}
          onReplace={replaceContent}
          articleId={articleId}
          onAudioGenerated={onAudioGenerated}
        />
      </div>

      {/* Footer stats */}
      <div
        className="flex items-center justify-end gap-6 px-4 py-2 border-t text-xs"
        style={{ borderColor: 'var(--bg-border)', color: 'var(--text-muted)' }}
      >
        <span>{words.toLocaleString()} words</span>
        <span>{chars.toLocaleString()} characters</span>
      </div>
    </div>
  )
}
