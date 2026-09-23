import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const sessionToken = localStorage.getItem('attendance_session_token')
    if (!sessionToken) {
      setIsLoading(false)
      return
    }

    supabase.rpc('get_session_user', { p_session_token: sessionToken })
      .then(({ data, error }) => {
        if (!error && data?.[0]) setUser(data[0])
        else localStorage.removeItem('attendance_session_token')
      })
      .catch(() => localStorage.removeItem('attendance_session_token'))
      .finally(() => setIsLoading(false))
  }, [])

  async function login(username, otp) {
    if (!username.trim() || !otp.trim()) {
      return { success: false, error: 'Please enter both fields' }
    }

    setIsLoading(true)
    let data
    let error
    try {
      ({ data, error } = await supabase.rpc('verify_login', {
        p_username: username.trim(),
        p_otp: otp.trim(),
      }))
    } catch (rpcError) {
      setIsLoading(false)
      return { success: false, error: rpcError.message || 'Unable to reach authentication service' }
    }
    setIsLoading(false)

    if (error || !data?.[0]) {
      return { success: false, error: error?.message || 'Invalid or expired OTP' }
    }

    localStorage.setItem('attendance_session_token', data[0].session_token)
    setUser(data[0])
    return { success: true }
  }

  async function logout() {
    const sessionToken = localStorage.getItem('attendance_session_token')
    if (sessionToken) {
      await supabase.rpc('logout_session', { p_session_token: sessionToken })
    }
    localStorage.removeItem('attendance_session_token')
    setUser(null)
  }

  async function issueLoginOtp(expiresMinutes = 10) {
    const sessionToken = localStorage.getItem('attendance_session_token')
    if (!sessionToken || user?.role !== 'super_admin') {
      return { success: false, error: 'Only an active super admin can generate OTPs. Please log in again.' }
    }
    try {
      const { data, error } = await supabase.rpc('issue_login_otp', {
        p_issuer_session_token: sessionToken,
        p_expires_minutes: expiresMinutes,
      })
      if (error) return { success: false, error: `${error.message}${error.details ? ` (${error.details})` : ''}${error.hint ? ` Hint: ${error.hint}` : ''} [${error.code || 'unknown'}]` }
      if (!data?.[0]?.otp) return { success: false, error: 'Supabase returned no OTP. Run migration 003 again.' }
      return { success: true, otp: data[0].otp, expiresAt: data[0].expires_at }
    } catch (rpcError) {
      return { success: false, error: rpcError.message || 'Unable to generate OTP' }
    }
  }

  async function getLoginLogs() {
    const sessionToken = localStorage.getItem('attendance_session_token')
    const { data, error } = await supabase.rpc('get_login_logs', {
      p_issuer_session_token: sessionToken,
      p_limit: 100,
    })
    return { data: data || [], error: error?.message }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'super_admin',
    login,
    issueLoginOtp,
    getLoginLogs,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}