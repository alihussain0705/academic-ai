import { useState, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import AuthLayout from './AuthLayout'
import Button from '../../components/ui/Button'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate('/')
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } }
      const message = axiosError?.response?.data?.detail || 'Login failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="page-enter">
        <h2 className="text-2xl font-bold text-surface-900 tracking-tight mb-1">
          Welcome back
        </h2>
        <p className="text-sm text-surface-500 mb-8">
          Sign in to continue to AI Academic Platform
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-danger-50 border border-danger-500/20 text-danger-600 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-surface-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              className="w-full rounded-lg border border-surface-200 bg-surface-0 px-3.5 py-2.5 text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-colors"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-surface-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-surface-200 bg-surface-0 px-3.5 py-2.5 pr-10 text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-colors"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <Button
            type="submit"
            loading={loading}
            disabled={!email || !password}
            className="w-full"
          >
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-surface-500">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
