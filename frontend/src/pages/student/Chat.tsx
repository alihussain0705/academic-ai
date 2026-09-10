import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { conversationAPI, chatAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import ChatMessage from '../../components/ChatMessage'
import type { Conversation, Message, ChatResponse } from '../../types/api'

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [subject, setSubject] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (conversationId) loadConversation()
  }, [conversationId])

  const loadConversation = async () => {
    try {
      // FIX: Use get() to load existing conversation, not create()
      const convRes = await conversationAPI.get(parseInt(conversationId!))
      const convData = convRes.data as Conversation
      setConversation(convData)
      const msgRes = await conversationAPI.getMessages(convData.id)
      setMessages(msgRes.data)
    } catch {
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !conversation || !subject.trim()) {
      setError('Please enter a question and a subject')
      return
    }
    setSending(true)
    setError('')
    try {
      const res = await chatAPI.send({
        task: input,
        conversation_id: conversation.id,
        subject,
      })
      const chatData = res.data as ChatResponse
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'user', content: input, created_at: new Date().toISOString() },
        { id: Date.now() + 1, role: 'assistant', content: chatData.response, created_at: new Date().toISOString() },
      ])
      setInput('')
    } catch {
      setError('Failed to send message. The AI service may be temporarily down.')
    } finally {
      setSending(false)
    }
  }

  if (!conversation) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{conversation.title || 'Chat'}</h2>
          <p className="text-sm text-gray-500">ID: {conversation.id}</p>
        </div>
        <Link to="/" className="text-blue-600 text-sm hover:underline">← Back to Dashboard</Link>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 bg-white rounded-lg p-4 border border-gray-200">
        {messages.length === 0 && !sending && (
          <p className="text-gray-400 text-center py-8">No messages yet. Start a conversation!</p>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-[80%]">
              <div className="animate-pulse text-gray-500">Thinking...</div>
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
              {error}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="Ask a question about your studies..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
        />
        <input
          type="text"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !input.trim() || !subject.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}