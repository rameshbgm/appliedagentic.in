// app/layout.tsx
import type { Metadata } from 'next'
import '@/styles/globals.css'

// Try to load Google Fonts, fall back gracefully if unavailable (e.g., in build/CI environments)
let fontClasses = ''
let fontVarStyle = ''

try {
  const { Space_Grotesk, Inter, JetBrains_Mono } = await import('next/font/google').then(async (m) => m)
  // This block intentionally uses dynamic font loading
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void Space_Grotesk
} catch {
  // Fall back to system fonts if Google Fonts unavailable
}

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
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0A0A0F" />
        <style>{`
          :root {
            --font-display: 'Space Grotesk', sans-serif;
            --font-body: 'Inter', sans-serif;
            --font-code: 'JetBrains Mono', monospace;
          }
        `}</style>
      </head>
      <body style={{ fontFamily: 'Inter, system-ui, sans-serif' }} className="antialiased">
        {children}
      </body>
    </html>
  )
}
