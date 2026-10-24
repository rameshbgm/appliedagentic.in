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
    <div className="p-admin min-h-screen grid lg:grid-cols-2" data-theme="light">
      {/* Brand panel — colour blocks, desktop only */}
      <section className="hidden lg:grid p-6 gap-4" style={{ gridTemplateRows: 'repeat(3, 1fr)' }} aria-hidden="true">
        {[
          { word: 'Write.', c: 'var(--cobalt)', fg: 'var(--on-dark)' },
          { word: 'Publish.', c: 'var(--sun)', fg: 'var(--on-light)' },
          { word: 'Teach.', c: 'var(--tomato)', fg: 'var(--on-dark)' },
        ].map((b, i) => (
          <div key={b.word} style={{ background: b.c, color: b.fg, borderRadius: 32, padding: '28px 34px', display: 'flex', alignItems: 'flex-end', animation: `p-rise .7s var(--ease-out) ${i * 0.12}s both` }}>
            <span className="p-display" style={{ fontSize: 'clamp(3.4rem, 7vw, 6.4rem)', animation: `p-stretch 1.3s cubic-bezier(.7,0,.2,1) ${0.2 + i * 0.12}s both` }}>{b.word}</span>
          </div>
        ))}
      </section>

      {/* Sign-in form */}
      <section className="flex items-center justify-center" style={{ padding: 'max(24px, env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) 24px max(16px, env(safe-area-inset-left, 0px))' }}>
        <div className="w-full" style={{ maxWidth: 400 }}>
          <div className="flex items-center gap-3 mb-10">
            <span className="p-mark__dot" aria-hidden="true" />
            <span className="p-display" style={{ fontSize: '1.4rem' }}>Applied Agentic</span>
          </div>

          <span className="p-label" style={{ color: 'var(--tomato)' }}>Admin access</span>
          <h1 className="p-display" style={{ fontSize: 'clamp(3rem, 13vw, 4.4rem)', margin: '6px 0 8px' }}>Sign in</h1>
          <p style={{ color: 'var(--ink-2)', marginBottom: 24 }}>Use your admin email and password.</p>

          <form onSubmit={handleSubmit} className="grid gap-4">
            {/* Rendered client-side only so password-manager extensions can't cause hydration mismatches */}
            {mounted && (
              <>
                <div className="grid gap-1.5">
                  <label htmlFor="login-email" className="text-sm font-bold">Email</label>
                  <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@appliedagentic.com" required autoFocus autoComplete="username" className="input" style={{ minHeight: 52, borderRadius: 999, paddingInline: 20 }} />
                </div>
                <div className="grid gap-1.5">
                  <label htmlFor="login-password" className="text-sm font-bold">Password</label>
                  <div className="relative">
                    <input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required autoComplete="current-password" className="input" style={{ minHeight: 52, borderRadius: 999, paddingInline: '20px 54px' }} />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-round p-round--sm" style={{ border: 0, background: 'transparent' }} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
                {error && (
                  <p role="alert" style={{ margin: 0, padding: '12px 18px', borderRadius: 18, background: 'color-mix(in srgb, var(--tomato) 12%, var(--surface))', color: 'var(--danger)', fontSize: '.92rem', fontWeight: 700, animation: 'p-pop .3s var(--ease-spring)' }}>
                    {error}
                  </p>
                )}
                <button type="submit" disabled={loading} className="p-btn p-btn--fill p-btn--block" style={{ minHeight: 54 }}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </>
            )}
          </form>

          {/* Quick Login — shown only when NEXT_PUBLIC_QUICK_LOGIN=true in env */}
          {process.env.NEXT_PUBLIC_QUICK_LOGIN === 'true' && (
            <div className="grid gap-2 mt-5">
              <button type="button" onClick={handleQuickLogin} disabled={loading} className="p-btn p-btn--soft p-btn--block">
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
