import { useState } from 'react'
import { Link } from 'react-router-dom'
import { documentAPI } from '../../services/api'
import Card from '../../components/Card'

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Upload Documents</h2>
          <p className="text-gray-500 text-sm mt-1">Upload academic PDF documents for AI processing</p>
        </div>
        <Link to="/" className="text-blue-600 text-sm hover:underline">← Back to Dashboard</Link>
      </div>

      <div className="max-w-2xl">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded text-sm">
                Document uploaded and processed successfully!
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="College name"
                  value={formData.college}
                  onChange={(e) => setFormData((prev) => ({ ...prev, college: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Department"
                  value={formData.department}
                  onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <input
                  type="number"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Semester"
                  value={formData.semester}
                  onChange={(e) => setFormData((prev) => ({ ...prev, semester: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input
                  type="number"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Unit"
                  value={formData.unit}
                  onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PDF File</label>
              <input
                type="file"
                accept=".pdf"
                required
                className="w-full text-sm border border-gray-300 rounded-md p-2"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-gray-500 mt-1">Only PDF files are allowed (max 10MB)</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  )
}