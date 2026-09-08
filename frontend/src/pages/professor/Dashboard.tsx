import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { conversationAPI } from '../../services/api'
import Card from '../../components/Card'
import LoadingSpinner from '../../components/LoadingSpinner'
import type { Conversation, Message } from '../../types/api'

export default function ProfessorDashboard() {
  const { user, logout } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
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

  const handleSelect = async (conv: Conversation) => {
    setSelectedConv(conv)
    try {
      const msgRes = await conversationAPI.getMessages(conv.id)
      setMessages(msgRes.data)
    } catch {
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Professor Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">Welcome, {user?.name || 'Professor'}</p>
        </div>
        <button onClick={() => logout()} className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600">
          Logout
        </button>
      </div>

      <nav className="flex gap-4 mb-6">
        <Link to="/" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-300">
          Conversations
        </Link>
        <Link to="/upload" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
          Upload Document
        </Link>
        <Link to="/documents" className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">
          Manage Documents
        </Link>
      </nav>

      <div className="flex gap-6">
        <div className="w-1/3">
          <Card>
            <h3 className="font-medium text-gray-800 mb-4">Conversations</h3>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelect(conv)}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      selectedConv?.id === conv.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="font-medium">{conv.title || 'Untitled'}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(conv.created_at).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="flex-1">
          <Card>
            <h3 className="font-medium text-gray-800 mb-4">
              {selectedConv ? `Conversation #${selectedConv.id}` : 'Select a conversation'}
            </h3>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Select a conversation to view messages</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`p-3 rounded ${msg.role === 'user' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                    <span className="text-xs font-medium text-gray-500 capitalize">{msg.role}:</span>
                    <p className="text-sm mt-1">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}