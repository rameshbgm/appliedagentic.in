// app/(admin)/login/LoginPageClient.tsx
'use client'
import { signIn } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Zap, Loader2, Eye, EyeOff, Brain, Shield, Rocket } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const doSignIn = async (em: string, pw: string) => {
    setLoading(true)
    try {
      const res = await signIn('credentials', { email: em, password: pw, redirect: false })
      if (res?.ok) {
        toast.success('Welcome back!')
        window.location.href = '/admin/dashboard'
      } else {
        toast.error('Invalid email or password')
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
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── LEFT: Animated branding panel ───────────────────────────────── */}
      <div className="anim-gradient-bg hidden lg:flex lg:w-1/2 xl:w-[58%] relative overflow-hidden flex-col justify-center items-start px-14 xl:px-24 py-16">

        {/* Blob decorations */}
        <div
          className="morph-blob absolute -top-32 -left-32 w-[520px] h-[520px] opacity-[0.12] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, #ec4899 100%)' }}
        />
        <div
          className="morph-blob absolute bottom-0 right-0 w-[380px] h-[380px] opacity-[0.10] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, #06b6d4 100%)', animationDelay: '-5s' }}
        />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-lg">
          {/* Logo mark */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-10 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' }}
          >
            <Zap size={26} className="text-white" />
          </div>

          {/* Main headline with glitch effect */}
          <h1
            className="font-display font-bold uppercase leading-[1.05] glitch-text mb-2"
            style={{ fontSize: 'clamp(2.6rem, 4.5vw, 4.5rem)', color: '#fff' }}
            data-text="Applied"
          >
            Applied
          </h1>
          <h1
            className="font-display font-bold uppercase leading-[1.05] flash-text mb-6"
            style={{ fontSize: 'clamp(2.6rem, 4.5vw, 4.5rem)' }}
          >
            Agentic AI
          </h1>

          <p className="text-base xl:text-lg leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.55)', maxWidth: '420px' }}>
            The definitive knowledge hub for AI professionals mastering Generative and Agentic AI for organizational transformation.
          </p>

          {/* Feature tags */}
          <div className="flex flex-wrap gap-3">
            <span className="login-tag"><Brain size={12} /> Generative AI</span>
            <span className="login-tag"><Rocket size={12} /> Agentic Systems</span>
            <span className="login-tag"><Shield size={12} /> Enterprise Ready</span>
          </div>
        </div>

        {/* Bottom watermark */}
        <p className="absolute bottom-8 left-14 xl:left-24 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Applied Agentic AI © {new Date().getFullYear()}
        </p>
      </div>

      {/* ── RIGHT: Login form ────────────────────────────────────────────── */}
      <div
        className="flex-1 flex items-center justify-center p-6 sm:p-10"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="w-full max-w-sm">

          {/* Mobile-only logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' }}
            >
              <Zap size={26} className="text-white" />
            </div>
            <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
              Applied Agentic AI
            </h1>
          </div>

          {/* Card */}
          <div
            className="rounded-3xl p-8 shadow-2xl"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)' }}
          >
            <h2 className="font-display font-bold text-xl mb-1" style={{ color: 'var(--text-primary)' }}>
              Welcome back
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Sign in to your admin account</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Entire form rendered client-side only — prevents hydration mismatches
                  caused by browser extensions (e.g. password managers) injecting elements */}
              {mounted && (
                <>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@appliedagentic.com"
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--bg-border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all pr-10"
                    style={{
                      background: 'var(--bg-surface)',
                      borderColor: 'var(--bg-border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' }}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
                </>
              )}
            </form>

            {/* Quick Login — shown only when NEXT_PUBLIC_QUICK_LOGIN=true in env */}
            {process.env.NEXT_PUBLIC_QUICK_LOGIN === 'true' && (
              <>
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px" style={{ background: 'var(--bg-border)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--bg-border)' }} />
                </div>

                <button
                  type="button"
                  onClick={handleQuickLogin}
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  style={{
                    background: 'rgba(108,61,255,0.1)',
                    border: '1px solid rgba(108,61,255,0.35)',
                    color: '#a78bfa',
                  }}
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
                  Quick Login as Admin
                </button>

                <p className="text-xs text-center mt-3" style={{ color: 'var(--text-muted)' }}>
                  admin@appliedagentic.com · Admin@2026!
                </p>
              </>
            )}
          </div>

          <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
            Applied Agentic AI © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}
