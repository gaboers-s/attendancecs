import { supabase } from '@/lib/supabase'

function sessionToken() {
	return localStorage.getItem('attendance_session_token')
}

export async function getEvents() {
	const token = sessionToken()
	if (!token) {
		return { data: [], error: 'No active session. Please log in again.' }
	}
	try {
		const { data, error } = await supabase.rpc('get_events', { p_session_token: token })
		if (error) {
			console.error('get_events RPC error:', error)
			return { data: [], error: error?.message || 'Failed to load events' }
		}
		return { data: data || [], error: null }
	} catch (err) {
		console.error('get_events exception:', err)
		return { data: [], error: err?.message || 'Failed to load events' }
	}
}

export async function createEvent(event) {
	const token = sessionToken()
	if (!token) {
		return { data: null, error: 'No active session. Please log in again.' }
	}
	const { data, error } = await supabase.rpc('create_event', { 
		p_session_token: token, 
		p_title: event.title,
		p_description: event.description,
		p_event_date: event.event_date,
		p_location: event.location,
		p_organizers: event.organizers
	})
	return { data: data?.[0], error: error?.message }
}

export async function updateEvent(id, event) {
	const token = sessionToken()
	if (!token) {
		return { data: null, error: 'No active session. Please log in again.' }
	}
	const { data, error } = await supabase.rpc('update_event', { 
		p_session_token: token, 
		p_event_id: id,
		p_title: event.title,
		p_description: event.description,
		p_event_date: event.event_date,
		p_location: event.location,
		p_organizers: event.organizers
	})
	return { data: data?.[0], error: error?.message }
}

export async function deleteEvent(id) {
	const token = sessionToken()
	if (!token) {
		return { error: 'No active session. Please log in again.' }
	}
	const { error } = await supabase.rpc('delete_event', { p_session_token: token, p_event_id: id })
	return { error: error?.message }
}
