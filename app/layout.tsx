// app/layout.tsx
import type { Metadata } from 'next'
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
import '@/styles/globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-code',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Applied Agentic AI',
    template: '%s | Applied Agentic AI',
  },
  description: 'The definitive knowledge hub for AI professionals mastering Generative and Agentic AI for organizational transformation.',
  keywords: ['agentic AI', 'generative AI', 'AI transformation', 'OpenAI', 'LLM', 'AI agents'],
  authors: [{ name: 'Applied Agentic AI' }],
  openGraph: {
    type: 'website',
    siteName: 'Applied Agentic AI',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0A0A0F" />
      </head>
      <body className="bg-[var(--bg-base)] text-[var(--text-primary)] font-body antialiased">
        {children}
      </body>
    </html>
  )
}
