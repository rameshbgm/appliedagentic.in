'use client'
// components/admin/editor/AIAssistPanel.tsx
// Top-bar AI assistant — generates proper markdown from a topic or raw text.
import { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp, Loader2, Music } from 'lucide-react'
import { toast } from 'sonner'

type Tab = 'text' | 'audio'

interface Props {
  onInsert: (md: string) => void
  onReplace: (md: string) => void
  onSetTitle?: (title: string) => void
  articleId?: number
  sectionId?: number
  sectionContent?: string
  onAudioGenerated?: (url: string) => void
}

const textModes = ['generate', 'expand', 'summarize', 'rewrite', 'improve', 'outline']
const textTones = ['informative', 'casual', 'professional', 'engaging', 'technical', 'simplified']
const textLengths = ['short', 'medium', 'long']
const ttsVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']

export default function AIAssistPanel({ onInsert, onReplace, onSetTitle, articleId, sectionId, sectionContent, onAudioGenerated }: Props) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('text')
  const [loading, setLoading] = useState(false)

  // Text
  const [textMode, setTextMode] = useState('generate')
  const [textTone, setTextTone] = useState('informative')
  const [textLength, setTextLength] = useState('medium')
  const [textPrompt, setTextPrompt] = useState('')
  const [withTitle, setWithTitle] = useState(false)

  // Audio
  const [audioSource, setAudioSource] = useState<'content' | 'custom'>('content')
  const [audioText, setAudioText] = useState('')
  const [audioVoice, setAudioVoice] = useState('alloy')
  const [audioSpeed, setAudioSpeed] = useState(1.0)

  const generateText = async (action: 'insert' | 'replace') => {
    if (!textPrompt.trim()) { toast.error('Enter a topic or text'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/ai/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textPrompt,
          mode: textMode,
          tone: textTone,
          length: textLength,
          format: 'markdown',
          generateTitle: withTitle,
        }),
      })
      const data = await res.json()
      if (data.success) {
        const md: string = data.data.text
        const generatedTitle: string = data.data.title ?? ''
        action === 'insert' ? onInsert(md) : onReplace(md)
        if (withTitle && generatedTitle && onSetTitle) {
          onSetTitle(generatedTitle)
          toast.success(`Content + title generated!`)
        } else {
          toast.success('Content generated!')
        }
      } else {
        toast.error(data.error ?? 'Generation failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const generateAudio = async () => {
    if (!articleId) { toast.error('Save the article first to attach audio'); return }
    const text = audioSource === 'custom' ? audioText : sectionContent
    if (!text?.trim()) { toast.error(audioSource === 'custom' ? 'Enter text to convert' : 'Section has no content'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/ai/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          sectionId,
          text,
          preprocessMarkdown: true,
          voice: audioVoice,
          speed: audioSpeed,
        }),
      })
      const data = await res.json()
      if (data.success) {
        onAudioGenerated?.(data.data.audioUrl)
        toast.success('Audio generated and attached!')
      } else {
        toast.error(data.error ?? 'Audio generation failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const Sel = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2.5 py-1.5 rounded-lg border text-xs outline-none capitalize"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
      >
        {options.map((o) => <option key={o} value={o} className="capitalize">{o}</option>)}
      </select>
    </div>
  )

  return (
    <div className="border-b" style={{ borderColor: 'var(--bg-border)', background: 'var(--bg-elevated)' }}>
      {/* Toggle bar */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-violet)' }}
      >
        <Sparkles size={13} />
        AI Assistant
        {open ? <ChevronUp size={13} className="ml-auto" /> : <ChevronDown size={13} className="ml-auto" />}
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="border-t" style={{ borderColor: 'var(--bg-border)' }}>
          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: 'var(--bg-border)' }}>
            {([['text', Sparkles, 'Content'], ['audio', Music, 'Audio']] as [Tab, React.ElementType, string][]).map(([t, Icon, label]) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors ${tab === t ? 'border-b-2' : ''}`}
                style={{
                  borderColor: tab === t ? 'var(--color-violet)' : 'transparent',
                  color: tab === t ? 'var(--color-violet)' : 'var(--text-muted)',
                }}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {tab === 'text' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Topic or raw text
                  </label>
                  <textarea
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value)}
                    placeholder="Enter a topic (e.g. 'Introduction to AI Agents') or paste raw content to rewrite/expand..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault()
                        generateText('insert')
                      }
                    }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Sel label="Mode" value={textMode} onChange={setTextMode} options={textModes} />
                  <Sel label="Tone" value={textTone} onChange={setTextTone} options={textTones} />
                  <Sel label="Length" value={textLength} onChange={setTextLength} options={textLengths} />
                </div>

                {/* Generate section title toggle */}
                <label
                  className="flex items-center gap-2 cursor-pointer select-none"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <input
                    type="checkbox"
                    checked={withTitle}
                    onChange={(e) => setWithTitle(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-xs">Also generate section title</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => generateText('insert')}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                    style={{ background: 'var(--color-violet)' }}
                  >
                    {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    Insert
                  </button>
                  <button
                    type="button"
                    onClick={() => generateText('replace')}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 border transition-opacity hover:opacity-90"
                    style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}
                  >
                    Replace All
                  </button>
                </div>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Generates formatted Markdown. Press ⌘+Enter to insert.{withTitle ? ' Section title will be set automatically.' : ''}
                </p>
              </div>
            )}

            {tab === 'audio' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  {(['content', 'custom'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setAudioSource(s)}
                      className="flex-1 py-1.5 rounded-xl text-xs font-medium capitalize border transition-colors"
                      style={{
                        borderColor: audioSource === s ? 'var(--color-violet)' : 'var(--bg-border)',
                        color: audioSource === s ? 'var(--color-violet)' : 'var(--text-muted)',
                        background: audioSource === s ? 'rgba(124,58,237,0.08)' : 'transparent',
                      }}
                    >
                      {s === 'content' ? 'Article Content' : 'Custom Text'}
                    </button>
                  ))}
                </div>
                {audioSource === 'custom' && (
                  <textarea
                    value={audioText}
                    onChange={(e) => setAudioText(e.target.value)}
                    placeholder="Text to convert to speech..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
                  />
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Sel label="Voice" value={audioVoice} onChange={setAudioVoice} options={ttsVoices} />
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>Speed — {audioSpeed}x</label>
                    <input type="range" min={0.25} max={4.0} step={0.25} value={audioSpeed} onChange={(e) => setAudioSpeed(parseFloat(e.target.value))} className="w-full mt-1" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={generateAudio}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
                  style={{ background: '#1E293B' }}
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <Music size={12} />}
                  Generate Audio
                </button>
                {!articleId && (
                  <p className="text-xs" style={{ color: '#f59e0b' }}>Save the article first to attach audio.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
