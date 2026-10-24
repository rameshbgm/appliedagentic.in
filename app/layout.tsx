// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'

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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F1F4F2' },
    { media: '(prefers-color-scheme: dark)', color: '#0E1216' },
  ],
}

// Applies the saved theme before first paint so there is no light/dark flash.
const themeScript = `try{var t=localStorage.getItem('aa-theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800;900&family=Overpass+Mono:wght@400;600&family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
