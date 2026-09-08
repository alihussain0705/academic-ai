import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { documentAPI } from '../../services/api'
import Card from '../../components/Card'
import LoadingSpinner from '../../components/LoadingSpinner'
import type { AcademicDocument } from '../../types/api'

export default function DocumentManagement() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<AcademicDocument[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return
    try {
      await documentAPI.deleteDocument(id)
      setDocuments((prev) => prev.filter((d) => d.id !== id))
    } catch {
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Document Management</h2>
          <p className="text-gray-500 text-sm mt-1">Manage uploaded academic documents</p>
        </div>
        <div className="flex gap-4">
          <Link to="/upload" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
            Upload New
          </Link>
          <button onClick={() => { logout(); navigate('/login') }} className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600">
            Logout
          </button>
        </div>
      </div>

      <Link to="/" className="text-blue-600 text-sm hover:underline mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid gap-4">
          {documents.length === 0 ? (
            <Card>
              <p className="text-gray-500 text-center py-8">No documents uploaded yet. Use the Upload button to add documents.</p>
            </Card>
          ) : (
            documents.map((doc) => (
              <Card key={doc.id} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">{doc.filename}</h3>
                  <p className="text-sm text-gray-500">
                    {doc.college} · {doc.department} · Semester {doc.semester} · Unit {doc.unit}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Status: <span className={`font-medium ${doc.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>{doc.status}</span>
                    {doc.chunk_count ? ` · ${doc.chunk_count} chunks` : ''}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}