import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { documentAPI } from '../../services/api'
import { Button, Card, EmptyState, LoadingSpinner } from '../../components/ui'
import { ArrowLeft, FileText, Download, BookOpen } from 'lucide-react'
import type { ClassDocument } from '../../types/api'

export default function ClassMaterials() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<ClassDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDocuments = useCallback(async () => {
    try {
      const res = await documentAPI.listClass()
      setDocuments(res.data as ClassDocument[])
    } catch {
      setError('Failed to load class materials.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  const handleDownload = async (doc: ClassDocument) => {
    try {
      const res = await documentAPI.download(doc.id)
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = doc.filename
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch {
      setError('Failed to download file.')
    }
  }

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Class Materials</h1>
          <p className="mt-1 text-sm text-surface-500">
            PDFs uploaded for your class: {user?.role === 'student' ? `${user?.name?.split(' ')[0] || 'Student'}` : ''}
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner label="Loading class materials..." />
      ) : error ? (
        <div className="rounded-lg bg-danger-50 border border-danger-500/20 text-danger-600 px-4 py-3 text-sm">
          {error}
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-7 w-7" />}
          title="No materials available"
          description="No PDFs have been uploaded for your class yet. Check back later."
          action={
            <Link to="/">
              <Button variant="secondary">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Card key={doc.id} variant="flat" padding="md">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger-50 text-danger-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-surface-800 truncate">
                    {doc.filename}
                  </h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-surface-500">{doc.subject}</span>
                    <span className="text-xs text-surface-400">Unit {doc.unit}</span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownload(doc)}
                  className="shrink-0"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
