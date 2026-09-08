import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { conversationAPI } from '../../services/api'
import Card from '../../components/Card'
import LoadingSpinner from '../../components/LoadingSpinner'
import type { Conversation } from '../../types/api'

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const res = await conversationAPI.list()
      const allConversations = res.data as Conversation[]
      
      // Filter to only conversations that have messages
      const conversationsWithMessages: Conversation[] = []
      for (const conv of allConversations) {
        try {
          const msgRes = await conversationAPI.getMessages(conv.id)
          if (msgRes.data && msgRes.data.length > 0) {
            conversationsWithMessages.push(conv)
          }
        } catch {
          // If we can't fetch messages, skip this conversation
        }
      }
      
      setConversations(conversationsWithMessages)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await conversationAPI.create()
      const newConv = res.data as Conversation
      // Navigate to chat page instead of adding empty conversation to list
      navigate(`/chat/${newConv.id}`)
    } catch {
    } finally {
      setCreating(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome, {user?.name || 'Student'}</h2>
          <p className="text-gray-500 text-sm mt-1">Your Academic AI Assistant</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Creating...' : '+ New Conversation'}
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : conversations.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No conversations yet</p>
            <p className="text-gray-400 text-sm mt-2">Click "New Conversation" to start!</p>
            <button
              onClick={handleCreate}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Start Chatting
            </button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {conversations.map((conv) => (
            <Link key={conv.id} to={`/chat/${conv.id}`}>
              <Card>
                <h3 className="font-medium text-gray-800">{conv.title || 'Untitled'}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(conv.created_at).toLocaleDateString()}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}