import { useState, useRef, type DragEvent } from 'react'
import { Link } from 'react-router-dom'
import { documentAPI } from '../../services/api'
import { Button, Card } from '../../components/ui'
import {
  Upload,
  FileText,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react'

export default function DocumentUpload() {
  const [formData, setFormData] = useState({
    college: '',
    department: '',
    semester: '',
    subject: '',
    unit: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile)
      setError('')
    } else {
      setError('Only PDF files are accepted')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a PDF file')
      return
    }
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      const data = new FormData()
      data.append('file', file)
      data.append('college', formData.college)
      data.append('department', formData.department)
      data.append('semester', formData.semester)
      data.append('subject', formData.subject)
      data.append('unit', formData.unit)

      await documentAPI.upload(data)
      setSuccess(true)
      setFile(null)
      setFormData({ college: '', department: '', semester: '', subject: '', unit: '' })
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } }
      const message = axiosError?.response?.data?.detail || 'Upload failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs font-medium text-surface-400 hover:text-surface-600 transition-colors mb-2"
        >
          <ArrowLeft className="h-3 w-3" />
          Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
          Upload Document
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          Upload academic PDF documents for AI processing
        </p>
      </div>

      <div className="max-w-2xl">
        {/* Success state */}
        {success && (
          <Card className="mb-6 border-success-500/20 bg-success-50/50">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-success-500/10 text-success-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-success-700">
                  Document uploaded successfully
                </p>
                <p className="text-xs text-success-600 mt-0.5">
                  Your document is being processed and will be available shortly.
                </p>
              </div>
              <button
                onClick={() => setSuccess(false)}
                className="text-success-500 hover:text-success-700 transition-colors cursor-pointer"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </Card>
        )}

        {/* Error state */}
        {error && (
          <Card className="mb-6 border-danger-500/20 bg-danger-50/50">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-danger-500/10 text-danger-600">
                <XCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-danger-700">
                  Upload failed
                </p>
                <p className="text-xs text-danger-600 mt-0.5">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="text-danger-500 hover:text-danger-700 transition-colors cursor-pointer"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          {/* Drop zone */}
          <Card
            className={`mb-6 transition-colors ${
              dragging
                ? 'border-brand-400 bg-brand-50/50'
                : file
                ? 'border-success-500/30'
                : 'border-dashed'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {file ? (
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-danger-50 text-danger-500">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-800 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-surface-500 mt-0.5">
                    {(file.size / 1024 / 1024).toFixed(2)} MB · PDF
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors cursor-pointer"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center py-8 cursor-pointer"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-100 text-surface-400 mb-3">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-surface-700 mb-1">
                  Drop a PDF here or click to browse
                </p>
                <p className="text-xs text-surface-400">
                  PDF files up to 10MB
                </p>
              </button>
            )}
          </Card>

          {/* Metadata fields */}
          <Card className="mb-6">
            <h3 className="text-sm font-semibold text-surface-800 mb-4">
              Document Metadata
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="doc-college" className="block text-sm font-medium text-surface-700 mb-1.5">
                  College
                </label>
                <input
                  id="doc-college"
                  type="text"
                  required
                  className="w-full rounded-lg border border-surface-200 bg-surface-0 px-3.5 py-2.5 text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-colors"
                  placeholder="College name"
                  value={formData.college}
                  onChange={(e) => setFormData((prev) => ({ ...prev, college: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="doc-department" className="block text-sm font-medium text-surface-700 mb-1.5">
                  Department
                </label>
                <input
                  id="doc-department"
                  type="text"
                  required
                  className="w-full rounded-lg border border-surface-200 bg-surface-0 px-3.5 py-2.5 text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-colors"
                  placeholder="Department"
                  value={formData.department}
                  onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="doc-semester" className="block text-sm font-medium text-surface-700 mb-1.5">
                  Semester
                </label>
                <input
                  id="doc-semester"
                  type="number"
                  required
                  min="1"
                  max="12"
                  className="w-full rounded-lg border border-surface-200 bg-surface-0 px-3.5 py-2.5 text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-colors"
                  placeholder="e.g. 3"
                  value={formData.semester}
                  onChange={(e) => setFormData((prev) => ({ ...prev, semester: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="doc-subject" className="block text-sm font-medium text-surface-700 mb-1.5">
                  Subject
                </label>
                <input
                  id="doc-subject"
                  type="text"
                  required
                  className="w-full rounded-lg border border-surface-200 bg-surface-0 px-3.5 py-2.5 text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-colors"
                  placeholder="e.g. Data Structures"
                  value={formData.subject}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="doc-unit" className="block text-sm font-medium text-surface-700 mb-1.5">
                  Unit
                </label>
                <input
                  id="doc-unit"
                  type="number"
                  required
                  min="1"
                  className="w-full rounded-lg border border-surface-200 bg-surface-0 px-3.5 py-2.5 text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-colors"
                  placeholder="e.g. 1"
                  value={formData.unit}
                  onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                />
              </div>
            </div>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            loading={loading}
            disabled={!file}
            className="w-full"
          >
            {loading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </form>
      </div>
    </div>
  )
}
