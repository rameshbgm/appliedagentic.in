'use client'
// components/admin/editor/BubbleMenuBar.tsx
import { useState } from 'react'
import { BubbleMenu } from '@tiptap/react/menus'
import { Editor } from '@tiptap/core'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, Code, Link2, Unlink,
  Highlighter, AlignLeft, AlignCenter, AlignRight,
} from 'lucide-react'
import LinkModal from './LinkModal'

interface Props {
  editor: Editor
}

export default function BubbleMenuBar({ editor }: Props) {
  const [showLinkModal, setShowLinkModal] = useState(false)
  const btn = (active: boolean) =>
    `p-1.5 rounded transition-all ${active
      ? 'bg-violet-500/25 text-violet-300'
      : 'hover:bg-white/10 text-gray-300'}`

  return (
    <>
    <BubbleMenu
      editor={editor}
      shouldShow={(props) => {
        const { from, to } = props.state.selection
        return from !== to && !props.editor.isActive('image') && !props.editor.isActive('codeBlock')
      }}
    >
      <div
        className="flex items-center gap-0.5 px-2 py-1.5 rounded-xl shadow-2xl border text-sm z-50"
        style={{
          background: '#1a1a2e',
          borderColor: 'rgba(255,255,255,0.12)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        {/* Headings */}
        <button type="button" title="H1" className={btn(editor.isActive('heading', { level: 1 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 size={14} />
        </button>
        <button type="button" title="H2" className={btn(editor.isActive('heading', { level: 2 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={14} />
        </button>
        <button type="button" title="H3" className={btn(editor.isActive('heading', { level: 3 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={14} />
        </button>

        <div className="w-px h-4 mx-1 bg-white/15" />

        {/* Inline formatting */}
        <button type="button" title="Bold (⌘B)" className={btn(editor.isActive('bold'))}
          onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={14} />
        </button>
        <button type="button" title="Italic (⌘I)" className={btn(editor.isActive('italic'))}
          onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={14} />
        </button>
        <button type="button" title="Underline (⌘U)" className={btn(editor.isActive('underline'))}
          onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={14} />
        </button>
        <button type="button" title="Strikethrough" className={btn(editor.isActive('strike'))}
          onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={14} />
        </button>

        <div className="w-px h-4 mx-1 bg-white/15" />

        {/* Alignment */}
        <button type="button" title="Align Left" className={btn(editor.isActive({ textAlign: 'left' }))}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <AlignLeft size={14} />
        </button>
        <button type="button" title="Align Center" className={btn(editor.isActive({ textAlign: 'center' }))}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <AlignCenter size={14} />
        </button>
        <button type="button" title="Align Right" className={btn(editor.isActive({ textAlign: 'right' }))}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <AlignRight size={14} />
        </button>

        <div className="w-px h-4 mx-1 bg-white/15" />

        {/* Code + Highlight + Link */}
        <button type="button" title="Inline Code" className={btn(editor.isActive('code'))}
          onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code size={14} />
        </button>
        <button type="button" title="Highlight" className={btn(editor.isActive('highlight'))}
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#6C3DFF33' }).run()}>
          <Highlighter size={14} />
        </button>
        <button type="button" title={editor.isActive('link') ? 'Edit link' : 'Add link'} className={btn(editor.isActive('link'))}
          onClick={() => setShowLinkModal(true)}>
          <Link2 size={14} />
        </button>
        {editor.isActive('link') && (
          <button type="button" title="Remove link" className={btn(false)}
            onClick={() => editor.chain().focus().unsetLink().run()}>
            <Unlink size={14} />
          </button>
        )}
      </div>
    </BubbleMenu>

    {showLinkModal && (
      <LinkModal
        initialHref={editor.getAttributes('link').href ?? ''}
        initialText={editor.state.doc.textBetween(
          editor.state.selection.from,
          editor.state.selection.to,
          ' '
        )}
        onInsert={(href, text) => {
          if (editor.state.selection.empty && text) {
            editor.chain().focus().insertContent(`<a href="${href}">${text}</a>`).run()
          } else {
            editor.chain().focus().setLink({ href }).run()
          }
          setShowLinkModal(false)
        }}
        onClose={() => setShowLinkModal(false)}
      />
    )}
    </>
  )
}
