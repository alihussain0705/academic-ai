import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { conversationAPI, chatAPI } from '../../services/api'
import ChatMessage from '../../components/ChatMessage'
import { ChatComposer, ChatEmptyState } from '../../components/chat'
import { LoadingSpinner } from '../../components/ui'
import { ArrowLeft, Loader2 } from 'lucide-react'
import type { Conversation, Message, ChatResponse } from '../../types/api'

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [subject, setSubject] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const loadConversation = useCallback(async () => {
    try {
      const convRes = await conversationAPI.get(parseInt(conversationId!))
      const convData = convRes.data as Conversation
      setConversation(convData)
      const msgRes = await conversationAPI.getMessages(convData.id)
      setMessages(msgRes.data)
    } catch {
      // ignore
    }
  }, [conversationId])

  useEffect(() => {
    if (conversationId) loadConversation()
  }, [conversationId, loadConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages, sending, scrollToBottom])

  const handleSend = async (messageText: string, subjectOverride?: string) => {
    const effectiveSubject = subjectOverride || subject
    if (!conversation || !effectiveSubject.trim()) {
      setError('Please enter a subject before sending messages.')
      return
    }
    setSending(true)
    setError('')
    try {
      const res = await chatAPI.send({
        task: messageText,
        conversation_id: conversation.id,
        subject: effectiveSubject,
      })
      const chatData = res.data as ChatResponse
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'user', content: messageText, created_at: new Date().toISOString() },
        { id: Date.now() + 1, role: 'assistant', content: chatData.response, created_at: new Date().toISOString() },
      ])
    } catch {
      setError('Failed to send message. The AI service may be temporarily down.')
    } finally {
      setSending(false)
    }
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner size="lg" label="Loading conversation..." />
      </div>
    )
  }

  return (
    <div className="page-enter flex flex-col h-[calc(100vh-4rem)] -mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Header */}
      <div className="shrink-0 border-b border-surface-200 bg-surface-0 px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-3xl flex items-center gap-3">
          <Link
            to="/"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-surface-800 truncate">
              {conversation.title || 'New Conversation'}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              {subject ? (
                <span className="text-xs text-surface-500">Subject: {subject}</span>
              ) : (
                <span className="text-xs text-surface-400 italic">Set a subject below to start chatting</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-surface-400">
              ID: {conversation.id}
            </span>
          </div>
        </div>
      </div>

      {/* Subject input bar — visible until a message has been sent */}
      {messages.length === 0 && (
        <div className="shrink-0 border-b border-surface-100 bg-surface-50 px-4 py-2.5 sm:px-6">
          <div className="mx-auto max-w-3xl flex items-center gap-3">
            <label htmlFor="chat-subject" className="text-xs font-medium text-surface-500 shrink-0">Subject:</label>
            <input
              id="chat-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Mathematics, Computer Science, History..."
              className="flex-1 text-sm bg-surface-0 border border-surface-200 rounded-lg px-3 py-1.5 text-surface-800 placeholder:text-surface-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
      >
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          {messages.length === 0 && !sending ? (
            <ChatEmptyState onSendPrompt={(prompt, sub) => {
              if (!subject.trim()) setSubject(sub)
              handleSend(prompt, sub)
            }} />
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {sending && (
                <div className="flex gap-3 justify-start">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 mt-0.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-surface-0 border border-surface-200 px-4 py-3 shadow-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-bounce" />
                      </div>
                      <span className="text-xs text-surface-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex justify-center">
                  <div className="rounded-lg bg-danger-50 border border-danger-500/20 text-danger-600 px-4 py-2.5 text-sm">
                    {error}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <ChatComposer
        onSend={handleSend}
        loading={sending}
        subject={subject}
      />

      {/* Inline subject setter when messages exist but subject is empty */}
      {subject && messages.length > 0 && (
        <div className="border-t border-surface-100 bg-surface-50 px-4 py-2 sm:px-6">
          <div className="mx-auto max-w-3xl flex items-center gap-2">
            <span className="text-xs text-surface-400">Subject:</span>
            <span className="text-xs font-medium text-surface-600">{subject}</span>
            <button
              onClick={() => setSubject('')}
              className="text-xs text-surface-400 hover:text-surface-600 transition-colors ml-1 cursor-pointer"
            >
              Change
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
