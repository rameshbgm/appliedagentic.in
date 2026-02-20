'use client'
// app/(admin)/settings/page.tsx
import { useState, useEffect } from 'react'
import { Save, Loader2, TestTube2 } from 'lucide-react'
import { toast } from 'sonner'

type TabId = 'general' | 'ai' | 'seo' | 'account'

const TABS: { id: TabId; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'ai', label: 'AI Config' },
  { id: 'seo', label: 'SEO & Social' },
  { id: 'account', label: 'Admin Account' },
]

export default function SettingsPage() {
  const [tab, setTab] = useState<TabId>('general')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  const [settings, setSettings] = useState({
    siteName: 'Applied Agentic AI',
    tagline: 'Master the AI era, one concept at a time.',
    siteUrl: '',
    seoDescription: '',
    socialTwitter: '',
    socialLinkedin: '',
    socialGithub: '',
    openaiTextModel: 'gpt-4o',
    openaiImageModel: 'dall-e-3',
    openaiAudioModel: 'tts-1',
    openaiTemperature: 0.7,
    openaiMaxTokens: 2048,
    openaiImageSize: '1024x1024',
    openaiImageQuality: 'standard',
    openaiTtsVoice: 'alloy',
  })

  const [account, setAccount] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    setLoading(true)
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings((s) => ({ ...s, ...data.data }))
        }
      })
      .finally(() => setLoading(false))
    fetch('/api/admin/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setAccount((a) => ({ ...a, name: data.data.name, email: data.data.email }))
      })
  }, [])

  const saveSettings = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (data.success) toast.success('Settings saved!')
      else toast.error(data.error ?? 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const saveAccount = async () => {
    if (account.newPassword && account.newPassword !== account.confirmPassword) {
      toast.error('Passwords do not match'); return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: account.name,
          email: account.email,
          currentPassword: account.currentPassword || undefined,
          newPassword: account.newPassword || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) { toast.success('Profile updated!'); setAccount((a) => ({ ...a, currentPassword: '', newPassword: '', confirmPassword: '' })) }
      else toast.error(data.error ?? 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const testAI = async () => {
    setTesting(true)
    try {
      const res = await fetch('/api/ai/test', { method: 'POST' })
      const data = await res.json()
      if (data.success) toast.success(`AI connected! ${data.data.models} models available.`)
      else toast.error(data.error ?? 'AI test failed')
    } finally {
      setTesting(false)
    }
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
  const inputStyle = { background: 'var(--bg-surface)', borderColor: 'var(--bg-border)', color: 'var(--text-primary)' }
  const label = (text: string) => <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{text}</label>

  if (loading) return <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-xl skeleton" />)}</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage site configuration</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'text-white shadow-lg' : ''}`}
            style={{
              background: tab === t.id ? 'linear-gradient(135deg,#6C3DFF,#00D4FF)' : 'transparent',
              color: tab === t.id ? 'white' : 'var(--text-muted)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card p-6 space-y-5">
        {tab === 'general' && (
          <>
            <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Site Name</label>
              <input value={settings.siteName} onChange={(e) => setSettings((s) => ({ ...s, siteName: e.target.value }))} className={inputClass} style={inputStyle} /></div>
            <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tagline</label>
              <input value={settings.tagline} onChange={(e) => setSettings((s) => ({ ...s, tagline: e.target.value }))} className={inputClass} style={inputStyle} /></div>
            <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Site URL</label>
              <input value={settings.siteUrl} onChange={(e) => setSettings((s) => ({ ...s, siteUrl: e.target.value }))} placeholder="https://appliedagentic.in" className={inputClass} style={inputStyle} /></div>
            <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>SEO Description</label>
              <textarea value={settings.seoDescription} onChange={(e) => setSettings((s) => ({ ...s, seoDescription: e.target.value }))} rows={3} className={inputClass + ' resize-none'} style={inputStyle} /></div>
            <button onClick={saveSettings} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: 'linear-gradient(135deg,#6C3DFF,#00D4FF)' }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Save
            </button>
          </>
        )}

        {tab === 'ai' && (
          <>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>OpenAI Configuration</h3>
              <button onClick={testAI} disabled={testing} className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border" style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}>
                {testing ? <Loader2 size={12} className="animate-spin" /> : <TestTube2 size={12} />}Test Connection
              </button>
            </div>
            <p className="text-xs p-3 rounded-xl" style={{ background: 'rgba(108,61,255,0.1)', color: '#A29BFE' }}>
              API key is configured via environment variable (OPENAI_API_KEY). Use this panel to configure model defaults.
            </p>
            {[
              { key: 'openaiTextModel', label: 'Text Model', placeholder: 'gpt-4o' },
              { key: 'openaiImageModel', label: 'Image Model', placeholder: 'dall-e-3' },
              { key: 'openaiAudioModel', label: 'Audio (TTS) Model', placeholder: 'tts-1' },
              { key: 'openaiImageSize', label: 'Default Image Size', placeholder: '1024x1024' },
              { key: 'openaiImageQuality', label: 'Image Quality', placeholder: 'standard' },
              { key: 'openaiTtsVoice', label: 'Default TTS Voice', placeholder: 'alloy' },
            ].map(({ key, label: lbl, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{lbl}</label>
                <input value={(settings as any)[key] ?? ''} onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))} placeholder={placeholder} className={inputClass} style={inputStyle} />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Temperature ({settings.openaiTemperature})</label>
                <input type="range" min={0} max={2} step={0.1} value={settings.openaiTemperature} onChange={(e) => setSettings((s) => ({ ...s, openaiTemperature: parseFloat(e.target.value) }))} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Max Tokens</label>
                <input type="number" value={settings.openaiMaxTokens} onChange={(e) => setSettings((s) => ({ ...s, openaiMaxTokens: parseInt(e.target.value) }))} className={inputClass} style={inputStyle} />
              </div>
            </div>
            <button onClick={saveSettings} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: 'linear-gradient(135deg,#6C3DFF,#00D4FF)' }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Save AI Config
            </button>
          </>
        )}

        {tab === 'seo' && (
          <>
            {[
              { key: 'socialTwitter', label: 'Twitter / X Username', placeholder: '@appliedagentic' },
              { key: 'socialLinkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/company/...' },
              { key: 'socialGithub', label: 'GitHub URL', placeholder: 'https://github.com/...' },
            ].map(({ key, label: lbl, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{lbl}</label>
                <input value={(settings as any)[key] ?? ''} onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))} placeholder={placeholder} className={inputClass} style={inputStyle} />
              </div>
            ))}
            <button onClick={saveSettings} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: 'linear-gradient(135deg,#6C3DFF,#00D4FF)' }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Save
            </button>
          </>
        )}

        {tab === 'account' && (
          <>
            <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Name</label>
              <input value={account.name} onChange={(e) => setAccount((a) => ({ ...a, name: e.target.value }))} className={inputClass} style={inputStyle} /></div>
            <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <input value={account.email} onChange={(e) => setAccount((a) => ({ ...a, email: e.target.value }))} className={inputClass} style={inputStyle} /></div>
            <div className="border-t pt-5" style={{ borderColor: 'var(--bg-border)' }}>
              <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Change Password</p>
              {[
                { key: 'currentPassword', label: 'Current Password' },
                { key: 'newPassword', label: 'New Password' },
                { key: 'confirmPassword', label: 'Confirm New Password' },
              ].map(({ key, label: lbl }) => (
                <div key={key} className="mb-4">
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{lbl}</label>
                  <input type="password" value={(account as any)[key]} onChange={(e) => setAccount((a) => ({ ...a, [key]: e.target.value }))} className={inputClass} style={inputStyle} />
                </div>
              ))}
            </div>
            <button onClick={saveAccount} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: 'linear-gradient(135deg,#6C3DFF,#00D4FF)' }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Update Profile
            </button>
          </>
        )}
      </div>
    </div>
  )
}
