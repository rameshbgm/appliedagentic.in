// components/public/MarkdownRenderer.tsx
// Markdown → HTML for article bodies. Styling lives in .tr-prose (styles/globals.css).
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { Components } from 'react-markdown'

interface Props { content: string; showImages?: boolean }

const components: Components = {
  // Wide tables scroll inside their own box instead of widening the page
  table({ node: _n, children, ...props }) {
    return (
      <div className="table-scroll-wrapper">
        <table id={props.id} className={props.className}>{children}</table>
      </div>
    )
  },
  img({ node: _n, src, alt, ...props }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={typeof src === 'string' ? src : undefined} alt={alt ?? ''} loading="lazy" decoding="async" id={props.id} className={props.className} />
  },
}

export default function MarkdownRenderer({ content, showImages = true }: Props) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={showImages ? components : { ...components, img: () => null }}>
      {content}
    </ReactMarkdown>
  )
}
