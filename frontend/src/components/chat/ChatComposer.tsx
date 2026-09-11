import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface ChatComposerProps {
  onSend: (message: string) => void
  disabled?: boolean
  loading?: boolean
  subject?: string
}

export default function ChatComposer({ onSend, disabled, loading, subject }: ChatComposerProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${Math.min(scrollHeight, 160)}px`
    }
  }, [message])

  const handleSend = () => {
    if (!message.trim() || disabled || loading) return
    onSend(message.trim())
    setMessage('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-surface-200 bg-surface-0 px-4 py-3 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-xl border border-surface-200 bg-surface-0 p-2 shadow-sm focus-within:border-brand-300 focus-within:shadow-sm transition-all duration-150">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={subject ? `Ask about ${subject}...` : 'Ask a question about your studies...'}
            disabled={disabled || loading}
            rows={1}
            className="flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none disabled:opacity-50 leading-relaxed"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || disabled || loading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white transition-all duration-150 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-surface-400">
          Press <kbd className="px-1 py-0.5 rounded bg-surface-100 text-surface-500 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-surface-100 text-surface-500 font-mono text-[10px]">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  )
}
