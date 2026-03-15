'use client'
// components/admin/editor/AIAssistPanel.tsx
import { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp, Loader2, Music } from 'lucide-react'
import { toast } from 'sonner'

type Tab = 'text' | 'audio'
type TextProvider = 'gemini' | 'openai'
type AudioProvider = 'gemini' | 'openai'

interface Props {
  onInsert: (md: string) => void
  onReplace: (md: string) => void
  onSetTitle?: (title: string) => void
  articleId?: number
  sectionId?: number
  sectionContent?: string
  onAudioGenerated?: (url: string | null) => void
}

const textModes = ['generate', 'expand', 'summarize', 'rewrite', 'improve', 'outline']
const textTones = ['informative', 'casual', 'professional', 'engaging', 'technical', 'simplified']
const textLengths = ['short', 'medium', 'long']

const TEXT_MODELS: Record<TextProvider, string[]> = {
  gemini: ['gemini-2.5-flash-preview', 'gemini-2.0-flash', 'gemini-1.5-pro'],
  openai: ['gpt-4o-mini', 'gpt-4o'],
}

const VOICES: Record<AudioProvider, string[]> = {
  gemini: ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede', 'Leda', 'Orus', 'Schedar', 'Laomedeia'],
  openai: ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer', 'verse'],
}

const PROVIDER_LABELS: Record<TextProvider | AudioProvider, string> = {
  gemini: 'Gemini',
  openai: 'OpenAI',
}

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
  const [textProvider, setTextProvider] = useState<TextProvider>('gemini')
  const [textModel, setTextModel] = useState(TEXT_MODELS.gemini[0])

  const handleTextProviderChange = (p: TextProvider) => {
    setTextProvider(p)
    setTextModel(TEXT_MODELS[p][0])
  }

  // Audio
  const [audioSource, setAudioSource] = useState<'content' | 'custom'>('content')
  const [audioText, setAudioText] = useState('')
  const [audioProvider, setAudioProvider] = useState<AudioProvider>('gemini')
  const [audioVoice, setAudioVoice] = useState(VOICES.gemini[3]) // 'Kore'

  const handleProviderChange = (p: AudioProvider) => {
    setAudioProvider(p)
    setAudioVoice(VOICES[p][0])
  }

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
          provider: textProvider,
          model: textModel,
        }),
      })
      const data = await res.json()
      if (data.success) {
        const md: string = data.data.text
        const generatedTitle: string = data.data.title ?? ''
        action === 'insert' ? onInsert(md) : onReplace(md)
        if (withTitle && generatedTitle && onSetTitle) {
          onSetTitle(generatedTitle)
          toast.success('Content + title generated!')
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
    // For custom text without a sectionId we still use the direct endpoint (no job to scope)
    const isCustomText = audioSource === 'custom'
    const text = isCustomText ? audioText : sectionContent
    if (!text?.trim()) { toast.error(isCustomText ? 'Enter text to convert' : 'Section has no content'); return }

    if (isCustomText) {
      // Custom text doesn't map to a section — use synchronous endpoint
      setLoading(true)
      try {
        const res = await fetch('/api/ai/generate-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId, sectionId, text, preprocessMarkdown: true, voice: audioVoice }),
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
      return
    }

    // Article content path — use background job so UI stays responsive
    setLoading(true)
    try {
      const jobRes = await fetch('/api/ai/audio-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, sectionId }),
      })
      const jobData = await jobRes.json()
      if (!jobRes.ok) { toast.error(jobData.error ?? 'Could not start audio job'); return }

      // Clear old audio in UI immediately (old MediaAsset deleted server-side above)
      onAudioGenerated?.(null)

      // Fire-and-forget: request survives even if user navigates away
      fetch('/api/ai/audio-job/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, sectionId, voice: audioVoice }),
        keepalive: true,
      }).catch(() => {})

      toast.info('Audio generating in background. Use the refresh button to check progress.')
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
        className="px-2.5 py-1.5 rounded-lg border text-xs outline-none"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
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
            {/* ── Content tab ── */}
            {tab === 'text' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Topic or raw text
                  </label>
                  <textarea
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value)}
                    placeholder="Enter a topic or paste raw content to rewrite/expand…"
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
                  <Sel label="Mode"   value={textMode}   onChange={setTextMode}   options={textModes} />
                  <Sel label="Tone"   value={textTone}   onChange={setTextTone}   options={textTones} />
                  <Sel label="Length" value={textLength} onChange={setTextLength} options={textLengths} />
                </div>
                {/* Provider + Model row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>Provider</label>
                    <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: 'var(--bg-border)' }}>
                      {(['gemini', 'openai'] as TextProvider[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleTextProviderChange(p)}
                          className="flex-1 py-1.5 text-xs font-medium transition-colors"
                          style={{
                            background: textProvider === p ? 'var(--color-violet)' : 'var(--bg-surface)',
                            color: textProvider === p ? '#fff' : 'var(--text-muted)',
                          }}
                        >
                          {PROVIDER_LABELS[p]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Sel label="Model" value={textModel} onChange={setTextModel} options={TEXT_MODELS[textProvider]} />
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none" style={{ color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={withTitle} onChange={(e) => setWithTitle(e.target.checked)} className="rounded" />
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
                  Generates formatted Markdown. Press ⌘+Enter to insert.
                </p>
              </div>
            )}

            {/* ── Audio tab ── */}
            {tab === 'audio' && (
              <div className="space-y-3">
                {/* Source toggle */}
                <div className="flex gap-2">
                  {(['content', 'custom'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setAudioSource(s)}
                      className="flex-1 py-1.5 rounded-xl text-xs font-medium border transition-colors"
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
                    placeholder="Text to convert to speech…"
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
                  />
                )}

                {/* Provider + Voice row */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Provider */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>
                      Provider
                    </label>
                    <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: 'var(--bg-border)' }}>
                      {(['gemini', 'openai'] as AudioProvider[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleProviderChange(p)}
                          className="flex-1 py-1.5 text-xs font-medium transition-colors"
                          style={{
                            background: audioProvider === p ? 'var(--color-violet)' : 'var(--bg-surface)',
                            color: audioProvider === p ? '#fff' : 'var(--text-muted)',
                          }}
                        >
                          {PROVIDER_LABELS[p]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Voice — filtered by selected provider */}
                  <Sel
                    label="Voice"
                    value={audioVoice}
                    onChange={setAudioVoice}
                    options={VOICES[audioProvider]}
                  />
                </div>

                <button
                  type="button"
                  onClick={generateAudio}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
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
