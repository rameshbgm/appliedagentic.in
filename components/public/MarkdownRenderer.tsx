'use client'
// components/public/MarkdownRenderer.tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { Components } from 'react-markdown'
import { motion } from 'framer-motion'

interface Props { content: string }

// Trigger slightly before element reaches the viewport
const vp = { once: true, margin: '-64px 0px' } as const
const ease = [0.22, 1, 0.36, 1] as const

// Only forward id + className — avoids the onDrag type clash between
// React's DragEventHandler and Framer Motion's pointer-based onDrag.
type Safe = { id?: string; className?: string }
const safe = (props: Record<string, unknown>): Safe => ({
  id: props.id as string | undefined,
  className: props.className as string | undefined,
})

const components: Components = {
  // ── Headings ───────────────────────────────────────────────────────────────
  h2({ node: _n, children, ...props }) {
    return (
      <motion.h2 {...safe(props)}
        initial={{ opacity: 0, y: -14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={vp}
        transition={{ duration: 0.58, ease }}
      >{children}</motion.h2>
    )
  },
  h3({ node: _n, children, ...props }) {
    return (
      <motion.h3 {...safe(props)}
        initial={{ opacity: 0, filter: 'blur(4px)', y: 8 }}
        whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        viewport={vp}
        transition={{ duration: 0.72, ease }}
      >{children}</motion.h3>
    )
  },
  h4({ node: _n, children, ...props }) {
    return (
      <motion.h4 {...safe(props)}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={vp}
        transition={{ duration: 0.52, ease }}
      >{children}</motion.h4>
    )
  },

  // ── Paragraph — gentle rise ───────────────────────────────────────────────
  p({ node: _n, children, ...props }) {
    return (
      <motion.p {...safe(props)}
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={vp}
        transition={{ duration: 0.62, ease }}
      >{children}</motion.p>
    )
  },

  // ── Blockquote — drift in from the left ───────────────────────────────────
  blockquote({ node: _n, children, ...props }) {
    return (
      <motion.blockquote {...safe(props)}
        initial={{ opacity: 0, x: -22 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={vp}
        transition={{ duration: 0.65, ease }}
      >{children}</motion.blockquote>
    )
  },

  // ── Code block — scale up ─────────────────────────────────────────────────
  pre({ node: _n, children, ...props }) {
    return (
      <motion.pre {...safe(props)}
        initial={{ opacity: 0, scale: 0.966, y: 10 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={vp}
        transition={{ duration: 0.58, ease: [0.34, 1.12, 0.64, 1] }}
      >{children}</motion.pre>
    )
  },

  // ── Image — zoom + blur settle ────────────────────────────────────────────
  img({ node: _n, src, alt, ...props }) {
    return (
      <motion.img
        src={src} alt={alt} {...safe(props)}
        initial={{ opacity: 0, scale: 1.03, filter: 'blur(4px)' }}
        whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        viewport={vp}
        transition={{ duration: 0.72, ease }}
      />
    )
  },

  // ── Lists — lift with scale ────────────────────────────────────────────────
  ul({ node: _n, children, ...props }) {
    return (
      <motion.ul {...safe(props)}
        initial={{ opacity: 0, y: 14, scale: 0.984 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={vp}
        transition={{ duration: 0.55, ease }}
      >{children}</motion.ul>
    )
  },
  ol({ node: _n, children, ...props }) {
    return (
      <motion.ol {...safe(props)}
        initial={{ opacity: 0, y: 14, scale: 0.984 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={vp}
        transition={{ duration: 0.55, ease }}
      >{children}</motion.ol>
    )
  },

  // ── Table — lift soft in scroll wrapper ───────────────────────────────────
  table({ node: _n, children, ...props }) {
    return (
      <motion.div
        className="table-scroll-wrapper"
        initial={{ opacity: 0, y: 16, scale: 0.988 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={vp}
        transition={{ duration: 0.58, ease }}
      >
        <table {...safe(props)}>{children}</table>
      </motion.div>
    )
  },
}

export default function MarkdownRenderer({ content }: Props) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  )
}
