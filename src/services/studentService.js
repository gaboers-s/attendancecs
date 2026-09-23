import { supabase } from '@/lib/supabase'

function sessionToken() {
	return localStorage.getItem('attendance_session_token')
}

export async function getStudents(eventId = null) {
	const token = sessionToken()
	if (!token) {
		return { data: [], error: 'No active session. Please log in again.' }
	}
	try {
		const { data, error } = await supabase.rpc('get_students', {
			p_session_token: token,
			p_event_id: eventId || null,
		})
		if (error) {
			console.error('get_students RPC error:', error)
			return { data: [], error: error?.message || 'Failed to load students' }
		}
		return { data: data || [], error: null }
	} catch (err) {
		console.error('get_students exception:', err)
		return { data: [], error: err?.message || 'Failed to load students' }
	}
}

export async function createStudent(student, eventId = null) {
	const token = sessionToken()
	if (!token) {
		return { data: null, error: 'No active session. Please log in again.' }
	}
	try {
		const { data, error } = await supabase.rpc('create_student', {
			p_session_token: token,
			p_student_id: student.student_id,
			p_first_name: student.first_name,
			p_last_name: student.last_name,
			p_middle_initial: student.middle_initial || '',
			p_course: student.course,
			p_year_level: student.year_level,
			p_section: student.section,
			p_event_id: eventId || null,
		})
		if (error) {
			console.error('create_student RPC error:', error)
			return { data: null, error: error?.message || 'Failed to create student' }
		}
		return { data: data?.[0], error: null }
	} catch (err) {
		console.error('create_student exception:', err)
		return { data: null, error: err?.message || 'Failed to create student' }
	}
}

export async function batchCreateStudents(students, eventId = null) {
	const token = sessionToken()
	if (!token) {
		return { data: null, error: 'No active session. Please log in again.' }
	}
	try {
		const { data, error } = await supabase.rpc('batch_create_students', {
			p_event_id: eventId || null,
			p_session_token: token,
			p_students: students,
		})
		if (error) {
			console.error('batch_create_students RPC error:', error)
			return { data: null, error: error?.message || 'Failed to import students' }
		}
		return { data: data?.[0], error: null }
	} catch (err) {
		console.error('batch_create_students exception:', err)
		return { data: null, error: err?.message || 'Failed to import students' }
	}
}

export async function updateStudent(id, student) {
	const token = sessionToken()
	if (!token) {
		return { data: null, error: 'No active session. Please log in again.' }
	}
	try {
		const { data, error } = await supabase.rpc('update_student', {
			p_session_token: token,
			p_student_id: id,
			p_first_name: student.first_name,
			p_last_name: student.last_name,
			p_middle_initial: student.middle_initial || '',
			p_course: student.course,
			p_year_level: student.year_level,
			p_section: student.section,
		})
		if (error) {
			console.error('update_student RPC error:', error)
			return { data: null, error: error?.message || 'Failed to update student' }
		}
		return { data: data?.[0], error: null }
	} catch (err) {
		console.error('update_student exception:', err)
		return { data: null, error: err?.message || 'Failed to update student' }
	}
}

export async function deleteStudent(id) {
	const token = sessionToken()
	if (!token) {
		return { error: 'No active session. Please log in again.' }
	}
	try {
		const { error } = await supabase.rpc('delete_student', {
			p_session_token: token,
			p_student_id: id,
		})
		if (error) {
			console.error('delete_student RPC error:', error)
			return { error: error?.message || 'Failed to delete student' }
		}
		return { error: null }
	} catch (err) {
		console.error('delete_student exception:', err)
		return { error: err?.message || 'Failed to delete student' }
	}
}
