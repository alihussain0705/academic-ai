import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { conversationAPI } from '../../services/api'
import { Button, Card, EmptyState, LoadingSpinner } from '../../components/ui'
import { MessageSquarePlus, Sparkles, ArrowRight, Clock, Pencil, Trash2, X, Check } from 'lucide-react'
import type { Conversation } from '../../types/api'

export default function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  const loadConversations = useCallback(async () => {
    try {
      const res = await conversationAPI.list()
      const allConversations = res.data as Conversation[]

      const conversationsWithMessages: Conversation[] = []
      for (const conv of allConversations) {
        try {
          const msgRes = await conversationAPI.getMessages(conv.id)
          if (msgRes.data && msgRes.data.length > 0) {
            conversationsWithMessages.push(conv)
          }
        } catch {
          // skip
        }
      }

      setConversations(conversationsWithMessages)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (editingId !== null && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await conversationAPI.create()
      const newConv = res.data as Conversation
      navigate(`/chat/${newConv.id}`)
    } catch {
      // ignore
    } finally {
      setCreating(false)
    }
  }

  const handleRename = async (id: number) => {
    if (!editValue.trim()) {
      setEditingId(null)
      return
    }
    try {
      await conversationAPI.rename(id, editValue.trim())
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: editValue.trim() } : c))
      )
    } catch {
      // ignore
    } finally {
      setEditingId(null)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await conversationAPI.delete(id)
      setConversations((prev) => prev.filter((c) => c.id !== id))
      setDeleteConfirmId(null)
    } catch {
      // ignore
    }
  }

  const startEditing = (conv: Conversation) => {
    setEditingId(conv.id)
    setEditValue(conv.title || '')
  }

  const getTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="page-enter space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
            {getTimeGreeting()}, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="mt-1.5 text-sm text-surface-500">
            Your AI-powered academic assistant is ready to help.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          loading={creating}
          size="lg"
          className="sm:w-auto w-full"
        >
          <Sparkles className="h-4 w-4" />
          Ask AI
        </Button>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card variant="interactive" padding="md" onClick={handleCreate}>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-surface-800">New Conversation</h3>
              <p className="mt-0.5 text-xs text-surface-500 leading-relaxed">
                Start a fresh chat with your AI study assistant
              </p>
            </div>
          </div>
        </Card>

        <Link to="/class-materials">
          <Card variant="interactive" padding="md">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-50 text-success-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-surface-800">Class Materials</h3>
                <p className="mt-0.5 text-xs text-surface-500 leading-relaxed">
                  View PDFs uploaded for your class
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Card variant="flat" padding="md" className="bg-surface-0 border-dashed sm:col-span-2 lg:col-span-1">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-100 text-surface-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-surface-800">Continue Learning</h3>
              <p className="mt-0.5 text-xs text-surface-500 leading-relaxed">
                Pick up where you left off in past conversations
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent conversations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-surface-800">Recent Conversations</h2>
          {conversations.length > 0 && (
            <span className="text-xs text-surface-400">{conversations.length} total</span>
          )}
        </div>

        {loading ? (
          <LoadingSpinner label="Loading conversations..." />
        ) : conversations.length === 0 ? (
          <EmptyState
            icon={<MessageSquarePlus className="h-7 w-7" />}
            title="No conversations yet"
            description="Start your first conversation to get help with your studies."
            action={
              <Button onClick={handleCreate} loading={creating}>
                <Sparkles className="h-4 w-4" />
                Start Chatting
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div key={conv.id}>
                {deleteConfirmId === conv.id ? (
                  <Card variant="flat" padding="sm">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <Trash2 className="h-4 w-4 text-danger-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-surface-700">Delete this conversation?</p>
                        <p className="text-xs text-surface-400">This conversation and its messages will be permanently deleted.</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors"
                          aria-label="Cancel delete"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(conv.id)}
                          className="p-1.5 rounded-lg text-danger-500 hover:bg-danger-50 transition-colors"
                          aria-label="Confirm delete"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Link to={`/chat/${conv.id}`} className="block group">
                    <Card variant="interactive" padding="sm">
                      <div className="flex items-center justify-between gap-4 px-2 py-1.5">
                        <div className="min-w-0 flex-1">
                          {editingId === conv.id ? (
                            <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
                              <input
                                ref={editInputRef}
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleRename(conv.id)
                                  if (e.key === 'Escape') setEditingId(null)
                                }}
                                onBlur={() => handleRename(conv.id)}
                                className="flex-1 text-sm bg-surface-0 border border-brand-400 rounded-lg px-2 py-1 text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                maxLength={200}
                              />
                              <button
                                onClick={(e) => { e.preventDefault(); handleRename(conv.id) }}
                                className="p-1 rounded text-success-600 hover:bg-success-50"
                                aria-label="Save rename"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => { e.preventDefault(); setEditingId(null) }}
                                className="p-1 rounded text-surface-400 hover:bg-surface-100"
                                aria-label="Cancel rename"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <h3 className="text-sm font-medium text-surface-700 group-hover:text-brand-600 transition-colors truncate">
                                {conv.title || 'Untitled conversation'}
                              </h3>
                              <p className="mt-0.5 text-xs text-surface-400">
                                {new Date(conv.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </p>
                            </>
                          )}
                        </div>
                        {editingId !== conv.id && (
                          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.preventDefault(); startEditing(conv) }}
                              className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors"
                              aria-label="Rename conversation"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.preventDefault(); setDeleteConfirmId(conv.id) }}
                              className="p-1.5 rounded-lg text-surface-400 hover:bg-danger-50 hover:text-danger-600 transition-colors"
                              aria-label="Delete conversation"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <ArrowRight className="h-4 w-4 text-surface-300 group-hover:text-brand-500 transition-colors" />
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
