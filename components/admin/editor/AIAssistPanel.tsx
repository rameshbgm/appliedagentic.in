'use client'
// components/admin/editor/AIAssistPanel.tsx
import { useState } from 'react'
import { Sparkles, Image as ImageIcon, Music, X, ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Tab = 'text' | 'image' | 'audio'
interface Props {
  onInsert: (html: string) => void
  onReplace: (html: string) => void
  articleId?: number
  onAudioGenerated?: (url: string) => void
}

const textModes = ['generate', 'continue', 'expand', 'summarize', 'rewrite', 'improve']
const textTones = ['informative', 'casual', 'professional', 'engaging', 'technical', 'simplified']
const textLengths = ['short', 'medium', 'long']
const ttsVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']

export default function AIAssistPanel({ onInsert, onReplace, articleId, onAudioGenerated }: Props) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('text')
  const [loading, setLoading] = useState(false)

  // Text tab state
  const [textMode, setTextMode] = useState('generate')
  const [textTone, setTextTone] = useState('informative')
  const [textLength, setTextLength] = useState('medium')
  const [textPrompt, setTextPrompt] = useState('')

  // Image tab state
  const [imagePrompt, setImagePrompt] = useState('')
  const [imageStyle, setImageStyle] = useState('vivid')
  const [imageSize, setImageSize] = useState('1024x1024')
  const [generatedImageUrl, setGeneratedImageUrl] = useState('')

  // Audio tab state
  const [audioSource, setAudioSource] = useState<'content' | 'custom'>('content')
  const [audioText, setAudioText] = useState('')
  const [audioVoice, setAudioVoice] = useState('alloy')
  const [audioSpeed, setAudioSpeed] = useState(1.0)

  const generateText = async (action: 'insert' | 'replace') => {
    if (!textPrompt.trim()) { toast.error('Enter a prompt'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/ai/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textPrompt, mode: textMode, tone: textTone, length: textLength }),
      })
      const data = await res.json()
      if (data.success) {
        const html = `<p>${data.data.text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`
        action === 'insert' ? onInsert(html) : onReplace(html)
        toast.success('Text generated!')
      } else {
        toast.error(data.error ?? 'Generation failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const generateImage = async () => {
    if (!imagePrompt.trim()) { toast.error('Enter a prompt'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt, style: imageStyle, size: imageSize }),
      })
      const data = await res.json()
      if (data.success) {
        setGeneratedImageUrl(data.data.url)
        toast.success('Image generated!')
      } else {
        toast.error(data.error ?? 'Image generation failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const generateAudio = async () => {
    if (!articleId) { toast.error('Save the article first to attach audio'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/ai/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          text: audioSource === 'custom' ? audioText : undefined,
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

  const SelectField = ({ label, value, onChange, options }: {
    label: string; value: string; onChange: (v: string) => void; options: string[]
  }) => (
    <div>
      <label className="text-xs mb-1 block capitalize" style={{ color: 'var(--text-muted)' }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border text-sm outline-none capitalize"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
      >
        {options.map((o) => <option key={o} value={o} className="capitalize">{o}</option>)}
      </select>
    </div>
  )

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="absolute right-4 top-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white shadow-lg transition-transform hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #6C3DFF, #00D4FF)' }}
        title="AI Assistant"
      >
        <Sparkles size={13} />
        AI
        <ChevronRight size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Panel */}
      {open && (
        <div
          className="w-80 flex-shrink-0 border-l flex flex-col overflow-y-auto"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--bg-border)' }}>
            <div className="flex items-center gap-2">
              <Sparkles size={15} style={{ color: 'var(--color-violet)' }} />
              <span className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>AI Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/10">
              <X size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: 'var(--bg-border)' }}>
            {([['text', Sparkles], ['image', ImageIcon], ['audio', Music]] as [Tab, any][]).map(([t, Icon]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium capitalize transition-colors ${
                  tab === t ? 'border-b-2 border-violet-500' : ''
                }`}
                style={{ color: tab === t ? '#A29BFE' : 'var(--text-muted)' }}
              >
                <Icon size={12} />
                {t}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 p-4 space-y-3">
            {tab === 'text' && (
              <>
                <SelectField label="Mode" value={textMode} onChange={setTextMode} options={textModes} />
                <SelectField label="Tone" value={textTone} onChange={setTextTone} options={textTones} />
                <SelectField label="Length" value={textLength} onChange={setTextLength} options={textLengths} />
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Prompt</label>
                  <textarea
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value)}
                    placeholder="Describe what to write..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => generateText('insert')}
                    disabled={loading}
                    className="flex-1 py-2 rounded-xl text-xs font-medium text-white disabled:opacity-50 flex items-center justify-center gap-1"
                    style={{ background: 'linear-gradient(135deg, #6C3DFF, #00D4FF)' }}
                  >
                    {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    Insert
                  </button>
                  <button
                    onClick={() => generateText('replace')}
                    disabled={loading}
                    className="flex-1 py-2 rounded-xl text-xs font-medium disabled:opacity-50 border"
                    style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}
                  >
                    Replace
                  </button>
                </div>
              </>
            )}

            {tab === 'image' && (
              <>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Image Prompt</label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="A futuristic AI neural network..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <SelectField label="Style" value={imageStyle} onChange={setImageStyle} options={['vivid', 'natural']} />
                <SelectField label="Size" value={imageSize} onChange={setImageSize} options={['1024x1024', '1792x1024', '1024x1792']} />
                <button
                  onClick={generateImage}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl text-xs font-medium text-white disabled:opacity-50 flex items-center justify-center gap-1.5"
                  style={{ background: 'linear-gradient(135deg, #6C3DFF, #00D4FF)' }}
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <ImageIcon size={12} />}
                  Generate Image
                </button>
                {generatedImageUrl && (
                  <div className="space-y-2">
                    <img src={generatedImageUrl} alt="AI generated" className="w-full rounded-xl border" style={{ borderColor: 'var(--bg-border)' }} />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onInsert(`<img src="${generatedImageUrl}" alt="${imagePrompt}" />`)}
                        className="py-2 rounded-xl text-xs font-medium border"
                        style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}
                      >
                        Insert in Article
                      </button>
                      <a
                        href={generatedImageUrl}
                        download
                        className="py-2 rounded-xl text-xs font-medium text-center border"
                        style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}
                      >
                        Download
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}

            {tab === 'audio' && (
              <>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Text Source</label>
                  <div className="flex gap-2">
                    {(['content', 'custom'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setAudioSource(s)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors border ${
                          audioSource === s ? 'border-violet-500' : ''
                        }`}
                        style={{
                          borderColor: audioSource === s ? '#6C3DFF' : 'var(--bg-border)',
                          color: audioSource === s ? '#A29BFE' : 'var(--text-muted)',
                          background: audioSource === s ? 'rgba(108,61,255,0.1)' : 'transparent',
                        }}
                      >
                        {s === 'content' ? 'Article Content' : 'Custom Text'}
                      </button>
                    ))}
                  </div>
                </div>
                {audioSource === 'custom' && (
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Custom Text</label>
                    <textarea
                      value={audioText}
                      onChange={(e) => setAudioText(e.target.value)}
                      placeholder="Text to convert to speech..."
                      rows={4}
                      className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none"
                      style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }}
                    />
                  </div>
                )}
                <SelectField label="Voice" value={audioVoice} onChange={setAudioVoice} options={ttsVoices} />
                <div>
                  <label className="text-xs mb-1 flex justify-between" style={{ color: 'var(--text-muted)' }}>
                    <span>Speed</span>
                    <span>{audioSpeed}x</span>
                  </label>
                  <input
                    type="range" min={0.25} max={4.0} step={0.25}
                    value={audioSpeed}
                    onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <button
                  onClick={generateAudio}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl text-xs font-medium text-white disabled:opacity-50 flex items-center justify-center gap-1.5"
                  style={{ background: 'linear-gradient(135deg, #6C3DFF, #00D4FF)' }}
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <Music size={12} />}
                  Generate Audio
                </button>
                {!articleId && (
                  <p className="text-xs text-yellow-400">Save the article first to attach audio.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
