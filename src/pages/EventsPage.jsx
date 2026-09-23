import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock3, Plus, RefreshCw } from 'lucide-react'
import { Toaster, toast } from 'react-hot-toast'
import MainLayout from '@/components/layout/MainLayout'
import EventCard from '@/components/events/EventCard'
import EventForm from '@/components/events/EventForm'
import { createEvent, deleteEvent, getEvents, updateEvent } from '@/services/eventService'
import { useAuth } from '@/context/AuthContext'

const groups = [
	{ key: 'current', label: 'Current event', description: 'Happening right now', icon: Clock3 },
	{ key: 'upcoming', label: 'Upcoming events', description: 'Ready for the next chapter', icon: CalendarDays },
	{ key: 'past', label: 'Past events', description: 'Your club history', icon: CalendarDays },
]

function classify(event, now = new Date()) {
	const eventDate = new Date(`${event.event_date}T00:00:00`)
	const nextDay = new Date(eventDate)
	nextDay.setDate(nextDay.getDate() + 1)
	if (eventDate > now) return 'upcoming'
	if (nextDay > now) return 'current'
	return 'past'
}

export default function EventsPage() {
	const { user, isSuperAdmin } = useAuth()
	const [events, setEvents] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [isSaving, setIsSaving] = useState(false)
	const [formEvent, setFormEvent] = useState(null)
	const [isFormOpen, setIsFormOpen] = useState(false)
	const [now, setNow] = useState(() => new Date())

	async function loadEvents() {
		setIsLoading(true)
		const result = await getEvents()
		setIsLoading(false)
		if (result.error) toast.error(result.error)
		else setEvents(result.data)
	}

	useEffect(() => { loadEvents() }, [])
	useEffect(() => {
		const timer = setInterval(() => setNow(new Date()), 60000)
		return () => clearInterval(timer)
	}, [])

	const groupedEvents = useMemo(() => {
		const grouped = { current: [], upcoming: [], past: [] }
		events.forEach((event) => grouped[classify(event, now)].push(event))
		grouped.upcoming.sort((a, b) => a.event_date.localeCompare(b.event_date))
		grouped.current.sort((a, b) => a.event_date.localeCompare(b.event_date))
		grouped.past.sort((a, b) => b.event_date.localeCompare(a.event_date))
		return grouped
	}, [events, now])

	function openCreate() { setFormEvent(null); setIsFormOpen(true) }
	function openEdit(event) { setFormEvent(event); setIsFormOpen(true) }

	async function saveEvent(payload) {
		setIsSaving(true)
		const result = formEvent ? await updateEvent(formEvent.id, payload) : await createEvent(payload)
		setIsSaving(false)
		if (result.error) return toast.error(result.error)
		setIsFormOpen(false)
		toast.success(formEvent ? 'Event updated' : 'Event created')
		loadEvents()
	}

	async function removeEvent(event) {
		if (!window.confirm(`Delete “${event.title}”? This cannot be undone.`)) return
		const result = await deleteEvent(event.id)
		if (result.error) toast.error(result.error)
		else { toast.success('Event deleted'); loadEvents() }
	}

	return <MainLayout><Toaster position="top-right" /><main className="mx-auto max-w-6xl px-5 py-8 lg:px-10 lg:py-10"><div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Club calendar</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Events</h1><p className="mt-2 text-sm text-slate-500">Keep every gathering, workshop, and outreach activity in view.</p></div>{isSuperAdmin && <button type="button" onClick={openCreate} className="button-primary inline-flex items-center justify-center gap-2"><Plus size={17} />Add event</button>}</div><div className="mb-6 grid gap-3 sm:grid-cols-3">{groups.map(({ key, label, icon: Icon }) => <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{label}</span><Icon size={17} className={key === 'current' ? 'text-emerald-500' : key === 'upcoming' ? 'text-blue-500' : 'text-slate-400'} /></div><strong className="mt-2 block text-2xl font-semibold text-slate-950">{groupedEvents[key].length}</strong></div>)}</div>{isLoading ? <div className="flex min-h-72 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-500"><RefreshCw size={17} className="mr-2 animate-spin" />Loading events...</div> : <div className="space-y-5">{groups.map(({ key, label, description, icon: Icon }) => <section key={key} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><div className={`rounded-lg p-2 ${key === 'current' ? 'bg-emerald-50 text-emerald-600' : key === 'upcoming' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}><Icon size={18} /></div><div><h2 className="font-semibold text-slate-950">{label}</h2><p className="text-xs text-slate-500">{description}</p></div></div>{groupedEvents[key].length ? groupedEvents[key].map((event) => <EventCard key={event.id} event={event} status={key} canManage={isSuperAdmin} onEdit={openEdit} onDelete={removeEvent} />) : <p className="px-6 py-8 text-center text-sm text-slate-500">No {key} events to show.</p>}</section>)}</div>}{isFormOpen && <EventForm event={formEvent} onSubmit={saveEvent} onClose={() => setIsFormOpen(false)} isSaving={isSaving} />}</main></MainLayout>
}
