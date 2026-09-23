import { supabase } from '@/lib/supabase'

export async function getDashboardOverview() {
  const emptyState = {
    totalStudents: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalAttendance: 0,
    completedCheckouts: 0,
    attendanceRate: 0,
    loginsToday: 0,
    recentLogins: [],
    error: null,
  }

  const sessionToken = localStorage.getItem('attendance_session_token')
  if (!sessionToken) {
    return { ...emptyState, error: 'No active session. Please log in again.' }
  }

  try {
    const { data, error } = await supabase.rpc('get_dashboard_overview', {
      p_session_token: sessionToken,
    })

    if (error) {
      console.error('get_dashboard_overview RPC error:', error)
      return { ...emptyState, error: error.message || 'Unable to load dashboard metrics' }
    }

    const row = data?.[0] || {}
    const recentLogins = Array.isArray(row.recent_logins) ? row.recent_logins : []

    return {
      ...emptyState,
      totalStudents: Number(row.total_students ?? 0),
      totalEvents: Number(row.total_events ?? 0),
      upcomingEvents: Number(row.upcoming_events ?? 0),
      totalAttendance: Number(row.total_attendance ?? 0),
      completedCheckouts: Number(row.completed_checkouts ?? 0),
      attendanceRate: Number(row.attendance_rate ?? 0),
      loginsToday: Number(row.logins_today ?? 0),
      recentLogins,
    }
  } catch (error) {
    console.error('Failed to load dashboard overview:', error)
    return {
      ...emptyState,
      error: error?.message || 'Unable to load dashboard metrics',
    }
  }
}
