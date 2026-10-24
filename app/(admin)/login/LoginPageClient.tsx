// app/(admin)/login/LoginPageClient.tsx
'use client'
import { signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Eye, EyeOff, Loader2, LogIn, Zap } from 'lucide-react'
import { toast } from 'sonner'
import BrandMark from '@/components/transit/BrandMark'
import ToastNotifier from '@/components/shared/ToastNotifier'

const LINES = ['var(--l1)', 'var(--l2)', 'var(--l3)', 'var(--l4)', 'var(--l5)']

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const doSignIn = async (em: string, pw: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await signIn('credentials', { email: em, password: pw, redirect: false })
      if (res?.ok) {
        toast.success('Signed in')
        window.location.href = '/admin/dashboard'
      } else {
        setError(res?.error === 'CredentialsSignin'
          ? 'That email and password do not match an admin account.'
          : (res?.error ?? 'Sign-in failed. Try again.'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await doSignIn(email, password)
  }

  // Dev-only: quick sign-in with the seeded admin account
  const handleQuickLogin = () => doSignIn('admin@appliedagentic.com', 'Admin@2026!')

  return (
    <>
    <ToastNotifier />
    <div className="tr-admin min-h-screen grid lg:grid-cols-2" data-theme="light">

      {/* Brand panel — departure-board style, desktop only */}
      <section className="hidden lg:flex flex-col justify-between p-14 xl:p-20" style={{ background: 'var(--board)', color: '#E6EAF0' }} aria-hidden="true">
        <div className="flex items-center gap-3">
          <BrandMark size={40} />
          <span className="tr-mono" style={{ fontSize: '.72rem', letterSpacing: '.12em', color: 'var(--board-dim)' }}>CONTROL ROOM</span>
        </div>
        <div>
          <p className="tr-display" style={{ fontSize: 'clamp(3.4rem, 6vw, 6rem)', color: '#fff' }}>
            Run the<br /><span style={{ color: 'var(--board-ink)' }}>network.</span>
          </p>
          <p style={{ color: 'var(--board-dim)', maxWidth: 420, marginTop: 18, lineHeight: 1.6 }}>
            Publish stops, lay new lines and keep every route to agentic AI on time.
          </p>
          <div style={{ display: 'grid', gap: 10, marginTop: 36, maxWidth: 420 }}>
            {LINES.map((c, i) => (
              <span key={c} style={{ height: 8, borderRadius: 4, background: c, width: `${100 - i * 14}%`, transformOrigin: 'left', animation: `tr-draw .8s ${i * 0.1}s both` }} />
            ))}
          </div>
        </div>
        <p className="tr-mono" style={{ fontSize: '.7rem', color: 'var(--board-dim)' }}>Applied Agentic AI © {new Date().getFullYear()}</p>
      </section>

      {/* Sign-in form */}
      <section className="flex items-center justify-center" style={{ padding: 'max(24px, env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) 24px max(16px, env(safe-area-inset-left, 0px))' }}>
        <div className="w-full" style={{ maxWidth: 400 }}>
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <BrandMark size={36} />
            <span className="tr-display" style={{ fontSize: '1.5rem' }}>Applied Agentic</span>
          </div>

          <span className="tr-eyebrow">Admin access</span>
          <h1 className="tr-display" style={{ fontSize: 'clamp(2.4rem, 10vw, 3.4rem)', margin: '6px 0 8px' }}>Sign in</h1>
          <p style={{ color: 'var(--ink-2)', marginBottom: 24 }}>Use your admin email and password.</p>

          <form onSubmit={handleSubmit} className="grid gap-4" noValidate={false}>
            {/* Rendered client-side only so password-manager extensions can't cause hydration mismatches */}
            {mounted && (
              <>
                <div className="grid gap-1.5">
                  <label htmlFor="login-email" className="text-sm font-semibold">Email</label>
                  <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@appliedagentic.com" required autoFocus autoComplete="username" className="input" style={{ minHeight: 48 }} />
                </div>
                <div className="grid gap-1.5">
                  <label htmlFor="login-password" className="text-sm font-semibold">Password</label>
                  <div className="relative">
                    <input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required autoComplete="current-password" className="input" style={{ minHeight: 48, paddingRight: 48 }} />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-1 top-1/2 -translate-y-1/2 tr-icon-btn" style={{ width: 40, height: 40, border: 0, background: 'transparent' }} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
                {error && (
                  <p role="alert" style={{ margin: 0, padding: '10px 14px', borderRadius: 12, background: 'color-mix(in srgb, var(--l1) 10%, var(--card))', color: 'var(--danger)', fontSize: '.9rem', fontWeight: 600 }}>
                    {error}
                  </p>
                )}
                <button type="submit" disabled={loading} className="tr-btn tr-btn--primary tr-btn--block" style={{ minHeight: 50 }}>
                  {loading ? <Loader2 size={17} className="animate-spin" /> : <LogIn size={17} />}
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </>
            )}
          </form>

          {/* Quick Login — shown only when NEXT_PUBLIC_QUICK_LOGIN=true in env */}
          {process.env.NEXT_PUBLIC_QUICK_LOGIN === 'true' && (
            <div className="grid gap-2 mt-5">
              <button type="button" onClick={handleQuickLogin} disabled={loading} className="tr-btn tr-btn--ghost tr-btn--block">
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
                Quick sign-in as admin
              </button>
              <p className="tr-mono text-center" style={{ fontSize: '.72rem', color: 'var(--muted)' }}>admin@appliedagentic.com · Admin@2026!</p>
            </div>
          )}
        </div>
      </section>
    </div>
    </>
  )
}
