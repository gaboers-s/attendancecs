import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import ModulePlaceholder from '@/pages/ModulePlaceholder'
import EventsPage from '@/pages/EventsPage'
import StudentsPage from '@/pages/StudentsPage'
import AttendancePage from '@/pages/AttendancePage'
import EmailConfigPage from '@/pages/EmailConfigPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
          <Route path="/certificates" element={<ProtectedRoute><ModulePlaceholder /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
          <Route path="/audit-logs" element={<ProtectedRoute requireSuperAdmin><ModulePlaceholder /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute requireSuperAdmin><EmailConfigPage /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}