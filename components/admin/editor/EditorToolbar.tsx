'use client'
// components/admin/editor/EditorToolbar.tsx
import { Editor } from '@tiptap/react'
import { useRef, useState } from 'react'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
  List, ListOrdered,
  CheckSquare, Quote, Code, Minus, Link2, Unlink,
  Image as ImageIcon, Youtube as YoutubeIcon,
  Table as TableIcon, Undo, Redo, Code2,
  Superscript as SuperscriptIcon, Subscript as SubscriptIcon,
  Highlighter, Palette, ChevronDown, RemoveFormatting,
  IndentIncrease, IndentDecrease, Pilcrow,
} from 'lucide-react'
import ImageUploadModal from './ImageUploadModal'
import EmbedModal from './EmbedModal'
import LinkModal from './LinkModal'

interface Props {
  editor: Editor
  articleId?: number
  isHtmlMode?: boolean
  onToggleHtmlMode?: () => void
}

type ToolBtn = { icon: React.ElementType; action: () => void; active?: boolean; title: string }

export default function EditorToolbar({ editor, articleId, isHtmlMode = false, onToggleHtmlMode }: Props) {
  const [showImageModal, setShowImageModal] = useState(false)
  const [showEmbedModal, setShowEmbedModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)
  const colorPickerRef = useRef<HTMLDivElement>(null)
  const highlightPickerRef = useRef<HTMLDivElement>(null)

  const colors = ['#6C3DFF','#00D4FF','#FF6B6B','#FFA502','#2ED573','#FF69B4','#ffffff','#64748b','#1e293b','#000000']
  const highlightColors = ['#6C3DFF33','#00D4FF33','#FFF9C4','#D4EDDA','#F8D7DA','#CCE5FF','#FFF3CD','hsl(0,0%,0%,0)']

  const fontSizes = ['12px','14px','16px','18px','20px','24px','28px','32px','36px','48px','64px']
  const lineHeights = [
    { label: 'Single (1.0)',    value: '1.0' },
    { label: 'Tight (1.25)',    value: '1.25' },
    { label: 'Snug (1.375)',    value: '1.375' },
    { label: 'Normal (1.5)',    value: '1.5' },
    { label: 'Relaxed (1.625)',value: '1.625' },
    { label: 'Loose (2.0)',     value: '2.0' },
    { label: 'Wide (2.5)',      value: '2.5' },
  ]
  const fontFamilies: { label: string; value: string; style: string }[] = [
    { label: 'Inter (default)',       value: 'Inter',              style: "'Inter', sans-serif" },
    { label: 'DM Sans',               value: 'DM Sans',            style: "'DM Sans', sans-serif" },
    { label: 'Outfit',                value: 'Outfit',             style: "'Outfit', sans-serif" },
    { label: 'Nunito',                value: 'Nunito',             style: "'Nunito', sans-serif" },
    { label: 'Space Grotesk',         value: 'Space Grotesk',      style: "'Space Grotesk', sans-serif" },
    { label: 'Merriweather',          value: 'Merriweather',       style: "'Merriweather', serif" },
    { label: 'Lora',                  value: 'Lora',               style: "'Lora', serif" },
    { label: 'Playfair Display',      value: 'Playfair Display',   style: "'Playfair Display', serif" },
    { label: 'Libre Baskerville',     value: 'Libre Baskerville',  style: "'Libre Baskerville', serif" },
    { label: 'Source Serif 4',        value: 'Source Serif 4',     style: "'Source Serif 4', serif" },
    { label: 'JetBrains Mono (code)', value: 'JetBrains Mono',     style: "'JetBrains Mono', monospace" },
  ]

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const normalizeEmbedUrl = (raw: string): URL | null => {
    try {
      const parsed = new URL(raw)
      if (!['http:', 'https:'].includes(parsed.protocol)) return null
      return parsed
    } catch {
      return null
    }
  }

  const matchesHost = (hostname: string, allowedHosts: string[]) =>
    allowedHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))

  const insertEmbed = (raw: string) => {
    const parsed = normalizeEmbedUrl(raw)
    if (!parsed) return
    const hostname = parsed.hostname.toLowerCase()
    const safeUrl = escapeHtml(parsed.toString())

    if (matchesHost(hostname, ['youtube.com', 'youtu.be'])) {
      editor.chain().focus().setYoutubeVideo({ src: parsed.toString() }).run()
      return
    }

    if (matchesHost(hostname, ['x.com', 'twitter.com'])) {
      editor.chain().focus().insertContent(`<p><a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a></p>`).run()
      return
    }

    if (matchesHost(hostname, ['loom.com', 'codesandbox.io'])) {
      editor.chain().focus().insertContent(
        `<div><iframe src="${safeUrl}" style="width:100%;height:420px;border:0;border-radius:12px;" loading="lazy" allowfullscreen></iframe></div>`
      ).run()
      return
    }

    editor.chain().focus().insertContent(`<p><a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a></p>`).run()
  }

  const Divider = () => <div className="w-px h-5 mx-1 shrink-0" style={{ background: 'var(--bg-border)' }} />

  const Btn = ({ icon: Icon, action, active, title }: ToolBtn) => (
    <button
      key={title}
      type="button"
      onClick={action}
      title={title}
      className={`p-2 rounded-lg transition-all text-sm shrink-0 ${
        active ? 'bg-violet-500/20 text-violet-400' : 'hover:bg-gray-100'
      }`}
      style={{ color: active ? '#A29BFE' : 'var(--text-secondary)' }}
    >
      <Icon size={15} />
    </button>
  )

  const groups: ToolBtn[][] = [
    // History
    [
      { icon: Undo, action: () => editor.chain().focus().undo().run(), title: 'Undo (⌘Z)' },
      { icon: Redo, action: () => editor.chain().focus().redo().run(), title: 'Redo (⌘⇧Z)' },
    ],
    // Headings
    [
      { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }), title: 'Heading 1' },
      { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }), title: 'Heading 2' },
      { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }), title: 'Heading 3' },
      { icon: Heading4, action: () => editor.chain().focus().toggleHeading({ level: 4 }).run(), active: editor.isActive('heading', { level: 4 }), title: 'Heading 4' },
      { icon: Heading5, action: () => editor.chain().focus().toggleHeading({ level: 5 }).run(), active: editor.isActive('heading', { level: 5 }), title: 'Heading 5' },
      { icon: Heading6, action: () => editor.chain().focus().toggleHeading({ level: 6 }).run(), active: editor.isActive('heading', { level: 6 }), title: 'Heading 6' },
      { icon: Pilcrow, action: () => editor.chain().focus().setParagraph().run(), active: editor.isActive('paragraph'), title: 'Paragraph' },
    ],
    // Inline
    [
      { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), title: 'Bold (⌘B)' },
      { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), title: 'Italic (⌘I)' },
      { icon: UnderlineIcon, action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline'), title: 'Underline (⌘U)' },
      { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike'), title: 'Strikethrough' },
      { icon: SuperscriptIcon, action: () => editor.chain().focus().toggleSuperscript().run(), active: editor.isActive('superscript'), title: 'Superscript' },
      { icon: SubscriptIcon, action: () => editor.chain().focus().toggleSubscript().run(), active: editor.isActive('subscript'), title: 'Subscript' },
    ],
    // Alignment
    [
      { icon: AlignLeft, action: () => editor.chain().focus().setTextAlign('left').run(), active: editor.isActive({ textAlign: 'left' }), title: 'Align Left' },
      { icon: AlignCenter, action: () => editor.chain().focus().setTextAlign('center').run(), active: editor.isActive({ textAlign: 'center' }), title: 'Align Center' },
      { icon: AlignRight, action: () => editor.chain().focus().setTextAlign('right').run(), active: editor.isActive({ textAlign: 'right' }), title: 'Align Right' },
      { icon: AlignJustify, action: () => editor.chain().focus().setTextAlign('justify').run(), active: editor.isActive({ textAlign: 'justify' }), title: 'Justify' },
    ],
    // Lists & blocks
    [
      { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), title: 'Bullet List' },
      { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), title: 'Ordered List' },
      { icon: CheckSquare, action: () => editor.chain().focus().toggleTaskList().run(), active: editor.isActive('taskList'), title: 'Task List' },
      { icon: IndentIncrease, action: () => editor.chain().focus().sinkListItem('listItem').run(), title: 'Indent' },
      { icon: IndentDecrease, action: () => editor.chain().focus().liftListItem('listItem').run(), title: 'Outdent' },
      { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote'), title: 'Blockquote' },
      { icon: Code, action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock'), title: 'Code Block' },
      { icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), title: 'Divider' },
    ],
    // Insert
    [
      { icon: Link2, action: () => setShowLinkModal(true), active: editor.isActive('link'), title: 'Add Link' },
      { icon: Unlink, action: () => editor.chain().focus().unsetLink().run(), title: 'Remove Link' },
      { icon: ImageIcon, action: () => setShowImageModal(true), title: 'Insert Image' },
      { icon: YoutubeIcon, action: () => setShowEmbedModal(true), title: 'Embed Video' },
      { icon: TableIcon, action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), title: 'Insert Table' },
    ],
    // Decoration
    [
      { icon: Highlighter, action: () => editor.chain().focus().toggleHighlight({ color: '#6C3DFF33' }).run(), active: editor.isActive('highlight'), title: 'Highlight' },
      { icon: RemoveFormatting, action: () => editor.chain().focus().unsetAllMarks().clearNodes().run(), title: 'Clear Formatting' },
    ],
  ]

  return (
    <>
      <div
        className="flex flex-wrap items-center gap-1 p-2 border-b sticky top-0 z-10 overflow-x-auto"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}
      >
        {/* Font family dropdown */}
        <select
          value={(editor.getAttributes('textStyle').fontFamily || '').replace(/['"]/g, '')}
          onChange={(e) => {
            const value = e.target.value
            if (value) editor.chain().focus().setFontFamily(value).run()
            else editor.chain().focus().unsetFontFamily().run()
          }}
          className="px-2 py-1.5 rounded-lg border text-xs mr-1 outline-none shrink-0"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-secondary)', maxWidth: '130px' }}
          title="Font Family"
        >
          <option value="">Default font</option>
          {fontFamilies.map(({ label, value, style }) => (
            <option key={value} value={value} style={{ fontFamily: style }}>{label}</option>
          ))}
        </select>

        {/* Font size */}
        <select
          value={(editor.getAttributes('textStyle').fontSize || '')}
          onChange={(e) => {
            const value = e.target.value
            if (value) {
              editor.chain().focus().setFontSize(value).run()
            } else {
              editor.chain().focus().unsetFontSize().run()
            }
          }}
          className="px-2 py-1.5 rounded-lg border text-xs mr-1 outline-none shrink-0"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-secondary)', width: '70px' }}
          title="Font Size"
        >
          <option value="">Size</option>
          {fontSizes.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Line height */}
        <select
          value={editor.getAttributes('paragraph').lineHeight || editor.getAttributes('heading').lineHeight || ''}
          onChange={(e) => {
            const value = e.target.value
            if (value) {
              editor.chain().focus().setLineHeight(value).run()
            } else {
              editor.chain().focus().unsetLineHeight().run()
            }
          }}
          className="px-2 py-1.5 rounded-lg border text-xs mr-1 outline-none shrink-0"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-secondary)', width: '80px' }}
          title="Line Height"
        >
          <option value="">Spacing</option>
          {lineHeights.map(({ label, value }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <Divider />

        {/* Render groups with dividers between them */}
        {groups.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {group.map((btn) => <Btn key={btn.title} {...btn} />)}
            {gi < groups.length - 1 && <Divider />}
          </div>
        ))}

        <Divider />

        {/* Text Color */}
        <div className="relative shrink-0" ref={colorPickerRef}>
          <button
            type="button"
            title="Text Color"
            onClick={() => { setShowColorPicker((v) => !v); setShowHighlightPicker(false) }}
            className="flex items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-all"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Palette size={15} />
            <ChevronDown size={12} />
          </button>
          {showColorPicker && (
            <div
              className="absolute top-full left-0 mt-1 p-2 rounded-xl shadow-xl grid grid-cols-5 gap-1 z-20 border"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}
            >
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  onClick={() => { editor.chain().focus().setColor(c).run(); setShowColorPicker(false) }}
                  className="w-6 h-6 rounded-lg border-2 border-white/20 hover:scale-110 transition-transform"
                  style={{ background: c }}
                />
              ))}
              <button
                key="unset"
                type="button"
                title="Remove color"
                onClick={() => { editor.chain().focus().unsetColor().run(); setShowColorPicker(false) }}
                className="col-span-5 text-xs py-1 rounded-lg hover:bg-gray-100 transition-all"
                style={{ color: 'var(--text-muted)' }}
              >
                Remove color
              </button>
            </div>
          )}
        </div>

        {/* Highlight Color */}
        <div className="relative shrink-0" ref={highlightPickerRef}>
          <button
            type="button"
            title="Highlight Color"
            onClick={() => { setShowHighlightPicker((v) => !v); setShowColorPicker(false) }}
            className={`flex items-center gap-1 p-2 rounded-lg transition-all ${editor.isActive('highlight') ? 'bg-violet-500/20' : 'hover:bg-gray-100'}`}
            style={{ color: editor.isActive('highlight') ? '#A29BFE' : 'var(--text-secondary)' }}
          >
            <Highlighter size={15} />
            <ChevronDown size={12} />
          </button>
          {showHighlightPicker && (
            <div
              className="absolute top-full left-0 mt-1 p-2 rounded-xl shadow-xl grid grid-cols-4 gap-1 z-20 border"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}
            >
              {highlightColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  onClick={() => {
                    if (c === 'hsl(0,0%,0%,0)') {
                      editor.chain().focus().unsetHighlight().run()
                    } else {
                      editor.chain().focus().toggleHighlight({ color: c }).run()
                    }
                    setShowHighlightPicker(false)
                  }}
                  className="w-7 h-7 rounded-lg border hover:scale-110 transition-transform"
                  style={{ background: c === 'hsl(0,0%,0%,0)' ? 'transparent' : c, borderColor: 'var(--bg-border)' }}
                >
                  {c === 'hsl(0,0%,0%,0)' && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>✕</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <Divider />

        <button
          type="button"
          title="HTML Mode"
          onClick={onToggleHtmlMode}
          className={`p-2 rounded-lg transition-all text-sm shrink-0 ${isHtmlMode ? 'bg-violet-500/20 text-violet-400' : 'hover:bg-gray-100'}`}
          style={{ color: isHtmlMode ? '#A29BFE' : 'var(--text-secondary)' }}
        >
          <Code2 size={15} />
        </button>
      </div>

      {showImageModal && (
        <ImageUploadModal
          onInsert={(url, alt) => {
            editor.chain().focus().setImage({ src: url, alt }).run()
            setShowImageModal(false)
          }}
          onClose={() => setShowImageModal(false)}
        />
      )}
      {showEmbedModal && (
        <EmbedModal
          onInsert={(url) => {
            insertEmbed(url)
            setShowEmbedModal(false)
          }}
          onClose={() => setShowEmbedModal(false)}
        />
      )}
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
