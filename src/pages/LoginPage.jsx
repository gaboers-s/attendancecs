import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogIn, User, KeyRound, GraduationCap } from 'lucide-react'
import { Toaster, toast } from 'react-hot-toast'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  if (isAuthenticated) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !otp.trim()) {
      toast.error('Please enter both username and OTP')
      return
    }

    setIsLoading(true)
    const result = await login(username, otp)
    setIsLoading(false)

    if (result.success) {
      toast.success('Login successful!')
      navigate('/dashboard')
    } else {
      toast.error(result.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Toaster position="top-right" />
      
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 mb-4">
            <GraduationCap className="text-blue-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">STI Attendance</h1>
          <p className="text-sm text-slate-500 mt-1">Smart-Certification Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-lg font-semibold text-center text-slate-900 mb-6">Admin Login</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                OTP Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm tracking-widest"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Contact your Super Admin to get the OTP
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Login
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Created by: Gabo
        </p>
      </div>
    </div>
  )
}