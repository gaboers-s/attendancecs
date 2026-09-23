import { supabase } from '@/lib/supabase'

function sessionToken() {
	return localStorage.getItem('attendance_session_token')
}

async function callAttendanceRpc(name, params) {
	const token = sessionToken()
	if (!token) return { data: [], error: 'No active session. Please log in again.' }
	const { data, error } = await supabase.rpc(name, { p_session_token: token, ...params })
	return { data: data || [], error: error?.message || null }
}

export function getAttendance(eventId) {
	return callAttendanceRpc('get_attendance', { p_event_id: eventId })
}

export function timeInStudent(studentId, eventId) {
	return callAttendanceRpc('time_in_student', { p_student_id: studentId, p_event_id: eventId })
}

export function timeOutStudent(studentId, eventId) {
	return callAttendanceRpc('time_out_student', { p_student_id: studentId, p_event_id: eventId })
}
