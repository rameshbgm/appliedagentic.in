'use client'
// components/admin/editor/EditorToolbar.tsx
import { Editor, useEditorState } from '@tiptap/react'
import { useRef, useState, useEffect, useCallback } from 'react'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare, Quote, Code, Minus,
  Link2, Unlink, Image as ImageIcon, Youtube as YoutubeIcon,
  Table as TableIcon, Undo, Redo, Code2,
  Superscript as SuperscriptIcon, Subscript as SubscriptIcon,
  Highlighter, ChevronDown, RemoveFormatting,
  IndentIncrease, IndentDecrease, Pilcrow, Type,
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

// ─── 48-color palette (8 rows × 6 cols) ──────────────────────────────────────
const TEXT_COLORS = [
  '#000000','#1a1a2e','#2d3436','#636e72','#b2bec3','#ffffff',
  '#b71c1c','#c62828','#e53935','#f44336','#ef9a9a','#ffcdd2',
  '#e65100','#ef6c00','#fb8c00','#ffa726','#ffcc02','#fff176',
  '#1b5e20','#2e7d32','#388e3c','#43a047','#81c784','#c8e6c9',
  '#0d47a1','#1565c0','#1976d2','#1e88e5','#90caf9','#bbdefb',
  '#311b92','#4527a0','#512da8','#6C3DFF','#b39ddb','#ede7f6',
  '#880e4f','#ad1457','#e91e63','#f06292','#f48fb1','#fce4ec',
  '#006064','#00838f','#00acc1','#00d4ff','#80deea','#e0f7fa',
]

// ─── 16-color highlight palette (4×4) ────────────────────────────────────────
const HIGHLIGHT_COLORS = [
  '#fff176','#ffe082','#ffd54f','#ffcc02',
  '#b3e5fc','#b2ebf2','#c8e6c9','#dcedc8',
  '#f8bbd9','#e1bee7','#d1c4e9','#ede7f6',
  'rgba(108,61,255,0.25)','rgba(0,212,255,0.25)','rgba(255,107,107,0.25)','rgba(255,165,0,0.2)',
]

const FONT_FAMILIES: { label: string; value: string }[] = [
  { label: 'Default',           value: '' },
  { label: 'Inter',             value: 'Inter' },
  { label: 'DM Sans',           value: 'DM Sans' },
  { label: 'Outfit',            value: 'Outfit' },
  { label: 'Nunito',            value: 'Nunito' },
  { label: 'Space Grotesk',     value: 'Space Grotesk' },
  { label: 'Merriweather',      value: 'Merriweather' },
  { label: 'Lora',              value: 'Lora' },
  { label: 'Playfair Display',  value: 'Playfair Display' },
  { label: 'Georgia',           value: 'Georgia' },
  { label: 'Times New Roman',   value: 'Times New Roman' },
  { label: 'JetBrains Mono',    value: 'JetBrains Mono' },
  { label: 'Courier New',       value: 'Courier New' },
]

const FONT_SIZES = ['10','11','12','14','16','18','20','22','24','28','32','36','40','48','56','64','72','96']

const LINE_HEIGHTS = [
  { label: 'Single (1.0)',     value: '1.0' },
  { label: 'Tight (1.25)',     value: '1.25' },
  { label: 'Snug (1.375)',     value: '1.375' },
  { label: 'Normal (1.5)',     value: '1.5' },
  { label: 'Relaxed (1.625)', value: '1.625' },
  { label: 'Loose (2.0)',      value: '2.0' },
  { label: 'Wide (2.5)',       value: '2.5' },
]

const PARAGRAPH_STYLES: { label: string; action: (e: Editor) => void; isActive: (e: Editor) => boolean }[] = [
  { label: 'Paragraph',  action: (e) => e.chain().focus().setParagraph().run(),               isActive: (e) => e.isActive('paragraph') && !e.isActive('blockquote') && !e.isActive('codeBlock') },
  { label: 'Heading 1',  action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),  isActive: (e) => e.isActive('heading', { level: 1 }) },
  { label: 'Heading 2',  action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),  isActive: (e) => e.isActive('heading', { level: 2 }) },
  { label: 'Heading 3',  action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),  isActive: (e) => e.isActive('heading', { level: 3 }) },
  { label: 'Heading 4',  action: (e) => e.chain().focus().toggleHeading({ level: 4 }).run(),  isActive: (e) => e.isActive('heading', { level: 4 }) },
  { label: 'Heading 5',  action: (e) => e.chain().focus().toggleHeading({ level: 5 }).run(),  isActive: (e) => e.isActive('heading', { level: 5 }) },
  { label: 'Heading 6',  action: (e) => e.chain().focus().toggleHeading({ level: 6 }).run(),  isActive: (e) => e.isActive('heading', { level: 6 }) },
  { label: 'Blockquote', action: (e) => e.chain().focus().toggleBlockquote().run(),            isActive: (e) => e.isActive('blockquote') },
  { label: 'Code Block', action: (e) => e.chain().focus().toggleCodeBlock().run(),             isActive: (e) => e.isActive('codeBlock') },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function escapeHtml(v: string) {
  return v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
}
function normalizeEmbedUrl(raw: string): URL | null {
  try { const p = new URL(raw); return ['http:','https:'].includes(p.protocol) ? p : null } catch { return null }
}
function matchesHost(hostname: string, hosts: string[]) {
  return hosts.some((h) => hostname === h || hostname.endsWith(`.${h}`))
}

const Divider = () => (
  <div className="w-px h-5 mx-0.5 shrink-0 self-center rounded-full opacity-40" style={{ background: 'var(--bg-border)' }} />
)

function Btn({
  icon: Icon, action, active, title, disabled,
}: {
  icon: React.ElementType
  action: () => void
  active?: boolean
  title: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={action}
      title={title}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center w-7 h-7 rounded-md transition-all shrink-0 select-none
        ${active ? 'bg-violet-100 text-violet-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}
        ${disabled ? 'opacity-30 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
      `}
    >
      <Icon size={14} strokeWidth={active ? 2.5 : 2} />
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function EditorToolbar({ editor, isHtmlMode = false, onToggleHtmlMode }: Props) {
  const [showImageModal,      setShowImageModal]      = useState(false)
  const [showEmbedModal,      setShowEmbedModal]      = useState(false)
  const [showLinkModal,       setShowLinkModal]       = useState(false)
  const [showColorPicker,     setShowColorPicker]     = useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)
  const [showStyleMenu,       setShowStyleMenu]       = useState(false)

  const colorRef     = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)
  const styleRef     = useRef<HTMLDivElement>(null)

  // Close all dropdowns on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (colorRef.current     && !colorRef.current.contains(e.target as Node))     setShowColorPicker(false)
      if (highlightRef.current && !highlightRef.current.contains(e.target as Node)) setShowHighlightPicker(false)
      if (styleRef.current     && !styleRef.current.contains(e.target as Node))     setShowStyleMenu(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // ── Reactive state — subscribes to cursor/selection changes ─────────────────
  const s = useEditorState({
    editor,
    selector: (ctx) => {
      const e = ctx.editor
      const ts  = e.getAttributes('textStyle')
      const bpa = e.isActive('heading') ? e.getAttributes('heading') : e.getAttributes('paragraph')

      let styleLabel = 'Paragraph'
      for (const ps of PARAGRAPH_STYLES) {
        if (ps.isActive(e)) { styleLabel = ps.label; break }
      }

      // fontSize stored as "16px" — strip unit
      const currentSize = (ts.fontSize ?? '').replace(/px$/i, '')
      // fontFamily may have surrounding quotes
      const currentFont = (ts.fontFamily ?? '').replace(/^['"]|['"]$/g, '')

      return {
        isBold:         e.isActive('bold'),
        isItalic:       e.isActive('italic'),
        isUnderline:    e.isActive('underline'),
        isStrike:       e.isActive('strike'),
        isCode:         e.isActive('code'),
        isSuperscript:  e.isActive('superscript'),
        isSubscript:    e.isActive('subscript'),
        isHighlight:    e.isActive('highlight'),
        isLink:         e.isActive('link'),
        isAlignLeft:    e.isActive({ textAlign: 'left' })    || (!e.isActive({ textAlign: 'center' }) && !e.isActive({ textAlign: 'right' }) && !e.isActive({ textAlign: 'justify' })),
        isAlignCenter:  e.isActive({ textAlign: 'center' }),
        isAlignRight:   e.isActive({ textAlign: 'right' }),
        isAlignJustify: e.isActive({ textAlign: 'justify' }),
        isBullet:       e.isActive('bulletList'),
        isOrdered:      e.isActive('orderedList'),
        isTask:         e.isActive('taskList'),
        isBlockquote:   e.isActive('blockquote'),
        isCodeBlock:    e.isActive('codeBlock'),
        canUndo:        e.can().undo(),
        canRedo:        e.can().redo(),
        canIndent:      e.can().sinkListItem('listItem'),
        canOutdent:     e.can().liftListItem('listItem'),
        styleLabel,
        currentSize,
        currentFont,
        currentLH:    bpa?.lineHeight ?? '',
        currentColor: ts.color ?? '',
      }
    },
  })

  const insertEmbed = useCallback((raw: string) => {
    const parsed = normalizeEmbedUrl(raw)
    if (!parsed) return
    const hn   = parsed.hostname.toLowerCase()
    const safe = escapeHtml(parsed.toString())
    if (matchesHost(hn, ['youtube.com','youtu.be'])) {
      editor.chain().focus().setYoutubeVideo({ src: parsed.toString() }).run(); return
    }
    editor.chain().focus().insertContent(
      matchesHost(hn, ['x.com','twitter.com','loom.com','codesandbox.io'])
        ? `<div><iframe src="${safe}" style="width:100%;height:420px;border:0;border-radius:12px;" loading="lazy" allowfullscreen></iframe></div>`
        : `<p><a href="${safe}" target="_blank" rel="noopener noreferrer">${safe}</a></p>`
    ).run()
  }, [editor])

  return (
    <>
      <div className="flex flex-col border-b" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}>

        {/* ══ ROW 1: styles, fonts, inline formatting, colors ══ */}
        <div className="flex flex-wrap items-center gap-0.5 px-2 pt-2 pb-1.5">

          {/* Paragraph / Heading style dropdown */}
          <div className="relative shrink-0" ref={styleRef}>
            <button
              type="button"
              onClick={() => setShowStyleMenu(v => !v)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium hover:bg-gray-50 transition-all"
              style={{ background:'var(--bg-surface)', borderColor:'var(--bg-border)', color:'var(--text-secondary)', minWidth:'118px' }}
            >
              <Pilcrow size={12} />
              <span className="flex-1 text-left truncate">{s.styleLabel}</span>
              <ChevronDown size={11} />
            </button>
            {showStyleMenu && (
              <div
                className="absolute top-full left-0 mt-1 rounded-xl border shadow-xl z-30 overflow-hidden"
                style={{ background:'var(--bg-elevated)', borderColor:'var(--bg-border)', minWidth:'160px' }}
              >
                {PARAGRAPH_STYLES.map((ps) => {
                  const active = ps.isActive(editor)
                  return (
                    <button
                      key={ps.label}
                      type="button"
                      onClick={() => { ps.action(editor); setShowStyleMenu(false) }}
                      className="w-full text-left px-3 py-2 text-sm transition-colors hover:bg-violet-50"
                      style={{ color: active ? '#6C3DFF' : 'var(--text-secondary)', fontWeight: active ? 600 : 400, background: active ? 'rgba(108,61,255,0.06)' : 'transparent' }}
                    >
                      {ps.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <Divider />

          {/* Font family */}
          <select
            value={s.currentFont}
            onChange={(e) => {
              const v = e.target.value
              if (v) editor.chain().focus().setFontFamily(v).run()
              else   editor.chain().focus().unsetFontFamily().run()
            }}
            className="px-2 py-1.5 rounded-md border text-xs outline-none shrink-0 cursor-pointer"
            style={{ background:'var(--bg-surface)', borderColor:'var(--bg-border)', color:'var(--text-secondary)', width:'130px' }}
            title="Font Family"
          >
            {FONT_FAMILIES.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {/* Font size — number input with hidden native select for scrollable list */}
          <div className="relative flex items-center shrink-0 ml-0.5">
            <input
              type="number"
              min={6} max={200}
              value={s.currentSize}
              onChange={(e) => {
                const v = e.target.value
                if (v && Number(v) > 0) editor.chain().focus().setFontSize(`${v}px`).run()
                else editor.chain().focus().unsetFontSize().run()
              }}
              className="px-2 pr-5 py-1.5 rounded-md border text-xs outline-none text-center"
              style={{ background:'var(--bg-surface)', borderColor:'var(--bg-border)', color:'var(--text-secondary)', width:'58px' }}
              placeholder="Size"
              title="Font Size"
            />
            <select
              tabIndex={-1}
              value={s.currentSize}
              onChange={(e) => {
                const v = e.target.value
                if (v) editor.chain().focus().setFontSize(`${v}px`).run()
                else   editor.chain().focus().unsetFontSize().run()
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-hidden="true"
            >
              <option value="">—</option>
              {FONT_SIZES.map((sz) => <option key={sz} value={sz}>{sz}</option>)}
            </select>
            <ChevronDown size={10} className="absolute right-1.5 pointer-events-none" style={{ color:'var(--text-muted)' }} />
          </div>

          {/* Line spacing */}
          <select
            value={s.currentLH}
            onChange={(e) => {
              const v = e.target.value
              if (v) editor.chain().focus().setLineHeight(v).run()
              else   editor.chain().focus().unsetLineHeight().run()
            }}
            className="px-2 py-1.5 rounded-md border text-xs outline-none shrink-0 cursor-pointer ml-0.5"
            style={{ background:'var(--bg-surface)', borderColor:'var(--bg-border)', color:'var(--text-secondary)', width:'90px' }}
            title="Line Spacing"
          >
            <option value="">Spacing</option>
            {LINE_HEIGHTS.map(({ label, value }) => <option key={value} value={value}>{label}</option>)}
          </select>

          <Divider />

          {/* History */}
          <Btn icon={Undo} action={() => editor.chain().focus().undo().run()} disabled={!s.canUndo} title="Undo (⌘Z)" />
          <Btn icon={Redo} action={() => editor.chain().focus().redo().run()} disabled={!s.canRedo} title="Redo (⌘⇧Z)" />

          <Divider />

          {/* Inline marks */}
          <Btn icon={Bold}            action={() => editor.chain().focus().toggleBold().run()}         active={s.isBold}        title="Bold (⌘B)" />
          <Btn icon={Italic}          action={() => editor.chain().focus().toggleItalic().run()}       active={s.isItalic}      title="Italic (⌘I)" />
          <Btn icon={UnderlineIcon}   action={() => editor.chain().focus().toggleUnderline().run()}    active={s.isUnderline}   title="Underline (⌘U)" />
          <Btn icon={Strikethrough}   action={() => editor.chain().focus().toggleStrike().run()}       active={s.isStrike}      title="Strikethrough" />
          <Btn icon={Code}            action={() => editor.chain().focus().toggleCode().run()}         active={s.isCode}        title="Inline Code (`)" />
          <Btn icon={SuperscriptIcon} action={() => editor.chain().focus().toggleSuperscript().run()}  active={s.isSuperscript} title="Superscript" />
          <Btn icon={SubscriptIcon}   action={() => editor.chain().focus().toggleSubscript().run()}    active={s.isSubscript}   title="Subscript" />

          <Divider />

          {/* Text color */}
          <div className="relative shrink-0" ref={colorRef}>
            <button
              type="button"
              title="Text Color"
              onClick={() => { setShowColorPicker(v => !v); setShowHighlightPicker(false) }}
              className="inline-flex flex-col items-center justify-center w-7 h-7 rounded-md hover:bg-gray-100 transition-all cursor-pointer gap-px"
            >
              <Type size={13} style={{ color:'var(--text-secondary)' }} />
              <div className="w-4 h-0.75 rounded-full" style={{ background: s.currentColor || '#000' }} />
            </button>
            {showColorPicker && (
              <div
                className="absolute top-full left-0 mt-1 p-2.5 rounded-xl shadow-2xl z-40 border"
                style={{ background:'var(--bg-elevated)', borderColor:'var(--bg-border)', width:'214px' }}
              >
                <p className="text-xs font-semibold mb-2" style={{ color:'var(--text-muted)' }}>Text Color</p>
                <div className="grid grid-cols-6 gap-1 mb-2">
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      title={c}
                      onClick={() => { editor.chain().focus().setColor(c).run(); setShowColorPicker(false) }}
                      className="w-7 h-7 rounded-md hover:scale-110 transition-transform"
                      style={{
                        background: c,
                        outline: s.currentColor === c ? '2px solid #6C3DFF' : '1px solid rgba(0,0,0,0.1)',
                        outlineOffset: s.currentColor === c ? '1px' : undefined,
                      }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().unsetColor().run(); setShowColorPicker(false) }}
                  className="w-full text-xs py-1.5 rounded-lg hover:bg-gray-100 transition-all border"
                  style={{ color:'var(--text-muted)', borderColor:'var(--bg-border)' }}
                >
                  ✕ Remove Color
                </button>
              </div>
            )}
          </div>

          {/* Highlight color */}
          <div className="relative shrink-0" ref={highlightRef}>
            <button
              type="button"
              title="Highlight"
              onClick={() => { setShowHighlightPicker(v => !v); setShowColorPicker(false) }}
              className={`inline-flex flex-col items-center justify-center w-7 h-7 rounded-md transition-all cursor-pointer gap-px
                ${s.isHighlight ? 'bg-yellow-50' : 'hover:bg-gray-100'}`}
            >
              <Highlighter size={13} style={{ color: s.isHighlight ? '#b45309' : 'var(--text-secondary)' }} />
              <div className="w-4 h-0.75 rounded-full" style={{ background: s.isHighlight ? '#fde047' : '#e2e8f0' }} />
            </button>
            {showHighlightPicker && (
              <div
                className="absolute top-full left-0 mt-1 p-2.5 rounded-xl shadow-2xl z-40 border"
                style={{ background:'var(--bg-elevated)', borderColor:'var(--bg-border)', width:'170px' }}
              >
                <p className="text-xs font-semibold mb-2" style={{ color:'var(--text-muted)' }}>Highlight Color</p>
                <div className="grid grid-cols-4 gap-1 mb-2">
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      title={c}
                      onClick={() => { editor.chain().focus().toggleHighlight({ color: c }).run(); setShowHighlightPicker(false) }}
                      className="w-8 h-8 rounded-md hover:scale-110 transition-transform border"
                      style={{ background: c, borderColor:'var(--bg-border)' }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().unsetHighlight().run(); setShowHighlightPicker(false) }}
                  className="w-full text-xs py-1.5 rounded-lg hover:bg-gray-100 transition-all border"
                  style={{ color:'var(--text-muted)', borderColor:'var(--bg-border)' }}
                >
                  ✕ Remove Highlight
                </button>
              </div>
            )}
          </div>

          <Divider />

          <Btn icon={RemoveFormatting} action={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear All Formatting" />

          <Divider />

          <button
            type="button"
            title="HTML Source"
            onClick={onToggleHtmlMode}
            className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs border transition-all shrink-0
              ${isHtmlMode ? 'bg-violet-100 text-violet-600 font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}
            style={{ borderColor: isHtmlMode ? '#a78bfa' : 'var(--bg-border)' }}
          >
            <Code2 size={13} />
            HTML
          </button>
        </div>

        {/* ══ ROW 2: alignment, lists, blocks, links, inserts ══ */}
        <div className="flex flex-wrap items-center gap-0.5 px-2 pb-2 pt-0">
          <Btn icon={AlignLeft}    action={() => editor.chain().focus().setTextAlign('left').run()}    active={s.isAlignLeft}    title="Align Left" />
          <Btn icon={AlignCenter}  action={() => editor.chain().focus().setTextAlign('center').run()}  active={s.isAlignCenter}  title="Align Center" />
          <Btn icon={AlignRight}   action={() => editor.chain().focus().setTextAlign('right').run()}   active={s.isAlignRight}   title="Align Right" />
          <Btn icon={AlignJustify} action={() => editor.chain().focus().setTextAlign('justify').run()} active={s.isAlignJustify} title="Justify" />

          <Divider />

          <Btn icon={List}        action={() => editor.chain().focus().toggleBulletList().run()}  active={s.isBullet}  title="Bullet List" />
          <Btn icon={ListOrdered} action={() => editor.chain().focus().toggleOrderedList().run()} active={s.isOrdered} title="Numbered List" />
          <Btn icon={CheckSquare} action={() => editor.chain().focus().toggleTaskList().run()}    active={s.isTask}    title="Task List" />

          <Divider />

          <Btn icon={IndentIncrease} action={() => editor.chain().focus().sinkListItem('listItem').run()} disabled={!s.canIndent}  title="Indent" />
          <Btn icon={IndentDecrease} action={() => editor.chain().focus().liftListItem('listItem').run()} disabled={!s.canOutdent} title="Outdent" />

          <Divider />

          <Btn icon={Quote} action={() => editor.chain().focus().toggleBlockquote().run()}  active={s.isBlockquote} title="Blockquote" />
          <Btn icon={Code}  action={() => editor.chain().focus().toggleCodeBlock().run()}   active={s.isCodeBlock}  title="Code Block" />
          <Btn icon={Minus} action={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule" />

          <Divider />

          <Btn icon={Link2}  action={() => setShowLinkModal(true)}                   active={s.isLink}     title="Insert / Edit Link" />
          <Btn icon={Unlink} action={() => editor.chain().focus().unsetLink().run()}  disabled={!s.isLink}  title="Remove Link" />

          <Divider />

          <Btn icon={ImageIcon}   action={() => setShowImageModal(true)}                                                               title="Insert Image" />
          <Btn icon={YoutubeIcon} action={() => setShowEmbedModal(true)}                                                               title="Embed Video" />
          <Btn icon={TableIcon}   action={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}    title="Insert Table" />
        </div>
      </div>

      {/* Modals */}
      {showImageModal && (
        <ImageUploadModal
          onInsert={(url, alt) => { editor.chain().focus().setImage({ src: url, alt }).run(); setShowImageModal(false) }}
          onClose={() => setShowImageModal(false)}
        />
      )}
      {showEmbedModal && (
        <EmbedModal
          onInsert={(url) => { insertEmbed(url); setShowEmbedModal(false) }}
          onClose={() => setShowEmbedModal(false)}
        />
      )}
      {showLinkModal && (
        <LinkModal
          initialHref={editor.getAttributes('link').href ?? ''}
          initialText={editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' ')}
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