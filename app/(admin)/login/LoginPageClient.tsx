// app/(admin)/login/LoginPageClient.tsx
'use client'
import { signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Eye, EyeOff, Loader2, LogIn, Zap } from 'lucide-react'
import { toast } from 'sonner'
import ToastNotifier from '@/components/shared/ToastNotifier'


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
    <div className="adm min-h-screen grid lg:grid-cols-2" data-theme="light">
      {/* Left page — a frontispiece, desktop only */}
      <section className="hidden lg:flex flex-col justify-between p-14 xl:p-20" style={{ background: 'var(--accent)', color: 'var(--on-accent)' }} aria-hidden="true">
        <span style={{ fontFamily: 'var(--display)', fontStyle: 'italic', fontSize: '1.5rem' }}>Applied Agentic</span>
        <div className="f-words" style={{ display: 'grid', gap: 18 }}>
          <span className="f-display" style={{ fontSize: 'clamp(3rem, 5vw, 4.8rem)', fontWeight: 300, color: 'inherit' }}>
            {'The editor’s desk.'.split(' ').map((w, i) => <span key={i}><span className="w" style={{ '--i': i } as React.CSSProperties}>{w}</span>{' '}</span>)}
          </span>
          <p style={{ fontFamily: 'var(--serif)', fontSize: '1.25rem', lineHeight: 1.6, maxWidth: 420, opacity: .85, margin: 0 }}>
            Write the chapters, set the order, and publish essays people come back to read.
          </p>
        </div>
        <span className="f-kicker" style={{ color: 'inherit', opacity: .7 }}>Applied Agentic AI © {new Date().getFullYear()}</span>
      </section>

      {/* Right page — the form */}
      <section className="flex items-center justify-center" style={{ padding: 'max(24px, env(safe-area-inset-top, 0px)) max(18px, env(safe-area-inset-right, 0px)) 24px max(18px, env(safe-area-inset-left, 0px))' }}>
        <div className="w-full" style={{ maxWidth: 400 }}>
          <span className="lg:hidden" style={{ display: 'block', fontFamily: 'var(--display)', fontStyle: 'italic', fontSize: '1.6rem', marginBottom: 36 }}>Applied Agentic</span>
          <span className="f-kicker f-kicker--accent">Admin access</span>
          <h1 className="f-display" style={{ fontSize: 'clamp(2.6rem, 11vw, 3.6rem)', margin: '8px 0 8px' }}>Sign in</h1>
          <p style={{ color: 'var(--ink-2)', marginBottom: 26, fontFamily: 'var(--serif)', fontSize: '1.08rem' }}>Use your admin email and password.</p>

          <form onSubmit={handleSubmit} className="grid gap-4">
            {/* Rendered client-side only so password-manager extensions can't cause hydration mismatches */}
            {mounted && (
              <>
                <div className="grid gap-1.5">
                  <label htmlFor="login-email" className="text-sm font-bold">Email</label>
                  <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@appliedagentic.com" required autoFocus autoComplete="username" className="input" style={{ minHeight: 50 }} />
                </div>
                <div className="grid gap-1.5">
                  <label htmlFor="login-password" className="text-sm font-bold">Password</label>
                  <div className="relative">
                    <input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required autoComplete="current-password" className="input" style={{ minHeight: 50, paddingRight: 52 }} />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="f-icon" style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)" }} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
                {error && (
                  <p role="alert" style={{ margin: 0, padding: '12px 16px', borderRadius: 14, background: 'color-mix(in srgb, var(--danger) 10%, var(--surface))', color: 'var(--danger)', fontSize: '.92rem', fontWeight: 600, animation: 'f-rise .3s var(--ease)' }}>
                    {error}
                  </p>
                )}
                <button type="submit" disabled={loading} className="f-btn f-btn--ink f-btn--block" style={{ minHeight: 52 }}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </>
            )}
          </form>

          {/* Quick Login — shown only when NEXT_PUBLIC_QUICK_LOGIN=true in env */}
          {process.env.NEXT_PUBLIC_QUICK_LOGIN === 'true' && (
            <div className="grid gap-2 mt-5">
              <button type="button" onClick={handleQuickLogin} disabled={loading} className="f-btn f-btn--quiet f-btn--block">
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
                Quick sign-in as admin
              </button>
              <p className="text-center" style={{ fontSize: '.78rem', color: 'var(--muted)' }}>admin@appliedagentic.com · Admin@2026!</p>
            </div>
          )}
        </div>
      </section>
    </div>
    </>
  )
}
