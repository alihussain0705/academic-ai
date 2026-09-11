import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Home,
  Upload,
  FileStack,
  LogOut,
  Sparkles,
  Menu,
  X,
  BookOpen,
} from 'lucide-react'
import Button from '../ui/Button'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  roles?: string[]
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
  { to: '/class-materials', label: 'Class Materials', icon: <BookOpen className="h-5 w-5" /> },
  { to: '/upload', label: 'Upload Document', icon: <Upload className="h-5 w-5" />, roles: ['professor', 'admin'] },
  { to: '/documents', label: 'Documents', icon: <FileStack className="h-5 w-5" />, roles: ['professor', 'admin'] },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role || 'student')
  )

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-sm">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-surface-800 leading-tight">AI Academic</span>
          <span className="text-xs text-surface-400 leading-tight">Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {filteredItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-50 text-brand-700 shadow-xs'
                  : 'text-surface-500 hover:bg-surface-100 hover:text-surface-700'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-surface-200 px-3 py-4 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-700 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-surface-400 capitalize">
              {user?.role || 'student'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-surface-500 hover:text-danger-600 hover:bg-danger-50"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-0 border border-surface-200 shadow-sm lg:hidden"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen ? <X className="h-5 w-5 text-surface-600" /> : <Menu className="h-5 w-5 text-surface-600" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-surface-900/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-surface-0 border-r border-surface-200 transition-transform duration-200 ease-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-surface-0 border-r border-surface-200">
        {sidebarContent}
      </aside>
    </>
  )
}
