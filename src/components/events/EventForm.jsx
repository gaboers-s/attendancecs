import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const blankEvent = { title: '', description: '', event_date: '', location: '', organizers: '' }

export default function EventForm({ event, onSubmit, onClose, isSaving }) {
	const [form, setForm] = useState(blankEvent)
	const [error, setError] = useState('')

	useEffect(() => {
		setForm(event ? { ...event, event_date: event.event_date || '', organizers: event.organizers || '' } : blankEvent)
		setError('')
	}, [event])

	function updateField(name, value) {
		setForm((current) => ({ ...current, [name]: value }))
	}

	async function handleSubmit(submitEvent) {
		submitEvent.preventDefault()
		if (!form.title.trim() || !form.event_date || !form.location.trim() || !form.organizers.trim()) return setError('Add an event name, date, venue, and organizers.')
		setError('')
		await onSubmit({ title: form.title.trim(), description: form.description.trim(), event_date: form.event_date, location: form.location.trim(), organizers: form.organizers.trim() })
	}

	return <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-5"><form onSubmit={handleSubmit} className="max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Event planning</p><h2 className="mt-1 text-xl font-semibold text-slate-950">{event ? 'Edit event' : 'Add event'}</h2></div><button type="button" onClick={onClose} aria-label="Close event form" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={19} /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="sm:col-span-2"><span className="field-label">Event name</span><input className="field" value={form.title} onChange={(e) => updateField('title', e.target.value)} placeholder="e.g. Monthly Club Assembly" autoFocus /></label><label className="sm:col-span-2"><span className="field-label">Description</span><textarea className="field min-h-24 resize-y" value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="What should attendees know?" /></label><label><span className="field-label">Date</span><input type="date" className="field" value={form.event_date} onChange={(e) => updateField('event_date', e.target.value)} /></label><label><span className="field-label">Venue</span><input className="field" value={form.location} onChange={(e) => updateField('location', e.target.value)} placeholder="e.g. Main Hall" /></label><label className="sm:col-span-2"><span className="field-label">Organizers</span><input className="field" value={form.organizers} onChange={(e) => updateField('organizers', e.target.value)} placeholder="e.g. Student Council" /></label></div>{error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}<div className="mt-7 flex justify-end gap-3"><button type="button" onClick={onClose} className="button-secondary">Cancel</button><button disabled={isSaving} type="submit" className="button-primary">{isSaving ? 'Saving...' : event ? 'Save changes' : 'Create event'}</button></div></form></div>
}
