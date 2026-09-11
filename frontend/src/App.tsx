import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Layout } from './components/layout'
import { LoadingSpinner } from './components/ui'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import StudentDashboard from './pages/student/Dashboard'
import ProfessorDashboard from './pages/professor/Dashboard'
import DocumentUpload from './pages/professor/DocumentUpload'
import DocumentManagement from './pages/professor/DocumentManagement'
import ChatPage from './pages/student/Chat'
import ClassMaterials from './pages/student/ClassMaterials'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-50">
        <LoadingSpinner size="lg" label="Loading..." />
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" />
  return <Layout>{children}</Layout>
}

function ProfessorRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-50">
        <LoadingSpinner size="lg" label="Loading..." />
      </div>
    )
  }
  if (user?.role !== 'professor' && user?.role !== 'admin') return <Navigate to="/" />
  return <>{children}</>
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {user?.role === 'professor' || user?.role === 'admin' ? <ProfessorDashboard /> : <StudentDashboard />}
          </ProtectedRoute>
        }
      />
      <Route path="/chat/:conversationId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/class-materials" element={<ProtectedRoute><ClassMaterials /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><ProfessorRoute><DocumentManagement /></ProfessorRoute></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><ProfessorRoute><DocumentUpload /></ProfessorRoute></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
