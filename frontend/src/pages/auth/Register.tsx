import { useState, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import AuthLayout from './AuthLayout'
import Button from '../../components/ui/Button'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    college: '',
    semester: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(formData)
      navigate('/')
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } }
      const message = axiosError?.response?.data?.detail || 'Registration failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isFormValid = formData.name && formData.email && formData.password &&
    formData.department && formData.college && formData.semester

  return (
    <AuthLayout>
      <div className="page-enter">
        <h2 className="text-2xl font-bold text-surface-900 tracking-tight mb-1">
          Create your account
        </h2>
        <p className="text-sm text-surface-500 mb-8">
          Join AI Academic Platform to enhance your learning
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-danger-50 border border-danger-500/20 text-danger-600 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-surface-700 mb-1.5">
              Full name
            </label>
            <input
              id="name"
              type="text"
              required
              autoFocus
              className="w-full rounded-lg border border-surface-200 bg-surface-0 px-3.5 py-2.5 text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-colors"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-surface-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-surface-200 bg-surface-0 px-3.5 py-2.5 text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-colors"
              placeholder="you@university.edu"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-surface-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-surface-200 bg-surface-0 px-3.5 py-2.5 pr-10 text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-colors"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="h-px bg-surface-200 my-1" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="college" className="block text-sm font-medium text-surface-700 mb-1.5">
                College
              </label>
              <input
                id="college"
                type="text"
                required
                className="w-full rounded-lg border border-surface-200 bg-surface-0 px-3.5 py-2.5 text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-colors"
                placeholder="College"
                value={formData.college}
                onChange={(e) => handleChange('college', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-surface-700 mb-1.5">
                Department
              </label>
              <input
                id="department"
                type="text"
                required
                className="w-full rounded-lg border border-surface-200 bg-surface-0 px-3.5 py-2.5 text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-colors"
                placeholder="Department"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-surface-700 mb-1.5">
              Semester
            </label>
            <input
              id="semester"
              type="text"
              required
              className="w-full rounded-lg border border-surface-200 bg-surface-0 px-3.5 py-2.5 text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-colors"
              placeholder="e.g. 3"
              value={formData.semester}
              onChange={(e) => handleChange('semester', e.target.value)}
            />
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={!isFormValid}
            className="w-full mt-2"
          >
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-surface-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
