import { useState, useCallback, lazy, Suspense } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, Check } from 'lucide-react'

const SyntaxHighlighter = lazy(() => import('react-syntax-highlighter'))

interface CodeBlockProps {
  language?: string
  children: string
}

function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [children])

  return (
    <div className="group relative my-3 rounded-lg border border-surface-200 bg-surface-0 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface-50 border-b border-surface-200">
        <span className="text-xs font-medium text-surface-500">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-surface-400 hover:text-surface-600 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <Suspense fallback={<div className="px-4 py-3 text-sm text-surface-400">Loading code...</div>}>
        <SyntaxHighlighter
          language={language || 'text'}
          style={{}}
          customStyle={{
            margin: 0,
            padding: '0.75rem 1rem',
            background: 'transparent',
            fontSize: '0.8125rem',
            lineHeight: '1.6',
          }}
          wrapLongLines
        >
          {children}
        </SyntaxHighlighter>
      </Suspense>
    </div>
  )
}

interface MarkdownRendererProps {
  content: string
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code(props) {
          const { children: codeChildren, className, ...rest } = props
          const match = /language-(\w+)/.exec(className || '')
          const codeString = String(codeChildren).replace(/\n$/, '')

          if (match) {
            return <CodeBlock language={match[1]}>{codeString}</CodeBlock>
          }

          if (codeString.includes('\n')) {
            return <CodeBlock>{codeString}</CodeBlock>
          }

          return (
            <code
              className="rounded-md bg-surface-100 px-1.5 py-0.5 text-sm font-mono text-brand-700"
              {...rest}
            >
              {codeChildren}
            </code>
          )
        },
        p(props) {
          const { children: pNode, ...rest } = props
          return <p className="mb-3 last:mb-0 leading-relaxed" {...rest}>{pNode}</p>
        },
        ul(props) {
          const { children: ulNode, ...rest } = props
          return <ul className="mb-3 ml-4 list-disc space-y-1 marker:text-surface-400" {...rest}>{ulNode}</ul>
        },
        ol(props) {
          const { children: olNode, ...rest } = props
          return <ol className="mb-3 ml-4 list-decimal space-y-1 marker:text-surface-400" {...rest}>{olNode}</ol>
        },
        li(props) {
          const { children: liNode, ...rest } = props
          return <li className="leading-relaxed" {...rest}>{liNode}</li>
        },
        h1(props) {
          const { children: h1Node, ...rest } = props
          return <h1 className="mb-3 text-xl font-bold text-surface-900" {...rest}>{h1Node}</h1>
        },
        h2(props) {
          const { children: h2Node, ...rest } = props
          return <h2 className="mb-2 text-lg font-semibold text-surface-800" {...rest}>{h2Node}</h2>
        },
        h3(props) {
          const { children: h3Node, ...rest } = props
          return <h3 className="mb-2 text-base font-semibold text-surface-800" {...rest}>{h3Node}</h3>
        },
        blockquote(props) {
          const { children: bqNode, ...rest } = props
          return (
            <blockquote className="my-3 border-l-2 border-brand-300 pl-4 text-surface-600 italic" {...rest}>
              {bqNode}
            </blockquote>
          )
        },
        table(props) {
          const { children: tNode, ...rest } = props
          return (
            <div className="my-3 overflow-x-auto rounded-lg border border-surface-200">
              <table className="w-full text-sm" {...rest}>{tNode}</table>
            </div>
          )
        },
        thead(props) {
          const { children: thNode, ...rest } = props
          return <thead className="bg-surface-50 border-b border-surface-200" {...rest}>{thNode}</thead>
        },
        th(props) {
          const { children: thCell, ...rest } = props
          return <th className="px-3 py-2 text-left font-semibold text-surface-700" {...rest}>{thCell}</th>
        },
        td(props) {
          const { children: tdCell, ...rest } = props
          return <td className="px-3 py-2 text-surface-600 border-t border-surface-100" {...rest}>{tdCell}</td>
        },
        hr() {
          return <hr className="my-4 border-surface-200" />
        },
        a(props) {
          const { children: aNode, href, ...rest } = props
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:text-brand-700 underline underline-offset-2"
              {...rest}
            >
              {aNode}
            </a>
          )
        },
        strong(props) {
          const { children: sNode, ...rest } = props
          return <strong className="font-semibold text-surface-800" {...rest}>{sNode}</strong>
        },
        em(props) {
          const { children: eNode, ...rest } = props
          return <em className="italic text-surface-700" {...rest}>{eNode}</em>
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
