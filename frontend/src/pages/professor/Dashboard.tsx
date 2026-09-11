import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { conversationAPI } from '../../services/api'
import { Button, Card, EmptyState, LoadingSpinner } from '../../components/ui'
import {
  Upload,
  FileStack,
  MessageSquare,
  Plus,
  Clock,
  ArrowRight,
} from 'lucide-react'
import type { Conversation } from '../../types/api'

export default function ProfessorDashboard() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] || 'Professor'}
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          Manage your academic content and AI conversations
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link to="/upload">
          <Card variant="interactive" className="group h-full">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-100 transition-colors">
                <Upload className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-surface-800 group-hover:text-brand-700 transition-colors">
                  Upload Document
                </h3>
                <p className="text-xs text-surface-500 mt-0.5">
                  Add PDF materials for AI processing
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/documents">
          <Card variant="interactive" className="group h-full">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-100 transition-colors">
                <FileStack className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-surface-800 group-hover:text-brand-700 transition-colors">
                  Manage Documents
                </h3>
                <p className="text-xs text-surface-500 mt-0.5">
                  View and organize uploaded content
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/chat/new">
          <Card variant="interactive" className="group h-full">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-100 transition-colors">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-surface-800 group-hover:text-brand-700 transition-colors">
                  AI Conversation
                </h3>
                <p className="text-xs text-surface-500 mt-0.5">
                  Start or continue an AI chat
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent conversations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-surface-800">
            Recent Conversations
          </h2>
          <Link
            to="/chat/new"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-surface-500 hover:text-brand-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New
          </Link>
        </div>

        <Card padding="none">
          {loading ? (
            <LoadingSpinner label="Loading conversations..." />
          ) : conversations.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="h-7 w-7" />}
              title="No conversations yet"
              description="Start a conversation to begin using the AI assistant."
              action={
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  Start Conversation
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-surface-100">
              {conversations.slice(0, 8).map((conv) => (
                <Link
                  key={conv.id}
                  to={`/chat/${conv.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-50 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-surface-700 group-hover:text-brand-700 transition-colors truncate">
                      {conv.title || 'Untitled conversation'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="h-3 w-3 text-surface-400" />
                      <span className="text-xs text-surface-400">
                        {new Date(conv.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-surface-300 group-hover:text-brand-500 transition-colors shrink-0 ml-4" />
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
