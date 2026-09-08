import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import StudentDashboard from './pages/student/Dashboard'
import ProfessorDashboard from './pages/professor/Dashboard'
import DocumentUpload from './pages/professor/DocumentUpload'
import DocumentManagement from './pages/professor/DocumentManagement'
import ChatPage from './pages/student/Chat'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" />
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
      <Route path="/documents" element={<ProtectedRoute><DocumentManagement /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><DocumentUpload /></ProtectedRoute>} />
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
