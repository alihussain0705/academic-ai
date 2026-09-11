import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { documentAPI } from '../../services/api'
import { Button, Badge, Card, EmptyState, LoadingSpinner } from '../../components/ui'
import {
  Upload,
  FileText,
  Trash2,
  ArrowLeft,
  X,
} from 'lucide-react'
import type { AcademicDocument } from '../../types/api'

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<AcademicDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<AcademicDocument | null>(null)
  const [deleting, setDeleting] = useState(false)

  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = useCallback(async () => {
    try {
      const res = await documentAPI.list()
      setDocuments(res.data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (deleteTarget && modalRef.current) {
      modalRef.current.focus()
    }
  }, [deleteTarget])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await documentAPI.deleteDocument(deleteTarget.id)
      setDocuments((prev) => prev.filter((doc) => doc.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      // ignore
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-medium text-surface-400 hover:text-surface-600 transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" />
            Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
            Document Management
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            Manage your uploaded academic documents
          </p>
        </div>
        <Button>
          <Link to="/upload" className="flex items-center gap-2 no-underline text-white">
            <Upload className="h-4 w-4" />
            Upload Document
          </Link>
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner label="Loading documents..." />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-7 w-7" />}
          title="No documents uploaded yet"
          description="Upload PDF documents to make them available for AI-powered search and conversation."
          action={
            <Button>
              <Link to="/upload" className="flex items-center gap-2 no-underline text-white">
                <Upload className="h-4 w-4" />
                Upload Your First Document
              </Link>
            </Button>
          }
        />
      ) : (
        <Card padding="none">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-surface-200 bg-surface-50 text-xs font-medium text-surface-500 uppercase tracking-wider">
            <div className="col-span-4">File</div>
            <div className="col-span-3">Location</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Chunks</div>
            <div className="col-span-1"></div>
          </div>

          {/* Table body */}
          <div className="divide-y divide-surface-100">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-5 py-4 hover:bg-surface-50 transition-colors items-center"
              >
                {/* File */}
                <div className="col-span-4 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger-50 text-danger-500">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-surface-800 truncate">
                        {doc.subject}
                      </p>
                      <p className="text-xs text-surface-400 sm:hidden">
                        {doc.college} · {doc.department}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="col-span-3 hidden sm:block">
                  <p className="text-sm text-surface-600">
                    {doc.college}
                  </p>
                  <p className="text-xs text-surface-400">
                    {doc.department} · Sem {doc.semester} · Unit {doc.unit}
                  </p>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <Badge
                    variant={
                      doc.status === 'completed'
                        ? 'success'
                        : doc.status === 'processing'
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {doc.status}
                  </Badge>
                </div>

                {/* Chunks */}
                <div className="col-span-2 hidden sm:block">
                  <span className="text-sm text-surface-600">
                    {doc.chunk_count != null ? `${doc.chunk_count} chunks` : '—'}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => setDeleteTarget(doc)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:text-danger-600 hover:bg-danger-50 transition-colors cursor-pointer"
                    title="Delete document"
                    aria-label="Delete document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-surface-900/30 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteTarget(null)}
          />
          <div
            ref={modalRef}
            tabIndex={-1}
            className="relative w-full max-w-sm bg-surface-0 rounded-xl border border-surface-200 shadow-xl p-6 outline-none"
          >
            <button
              onClick={() => !deleting && setDeleteTarget(null)}
              className="absolute top-4 right-4 text-surface-400 hover:text-surface-600 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-50 text-danger-500 mb-4">
              <Trash2 className="h-5 w-5" />
            </div>

            <h3 className="text-base font-semibold text-surface-800 mb-1">
              Delete document
            </h3>
            <p className="text-sm text-surface-500 mb-5">
              Are you sure you want to delete{' '}
              <span className="font-medium text-surface-700">
                {deleteTarget.filename}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={deleting}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
