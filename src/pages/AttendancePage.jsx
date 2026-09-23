import { useEffect, useMemo, useState } from 'react'
import { Download, Plus, RefreshCw, Upload } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import MainLayout from '@/components/layout/MainLayout'
import AttendanceTable from '@/components/attendance/AttendanceTable'
import StudentForm from '@/components/students/StudentForm'
import ImportModal from '@/components/students/ImportModal'
import { getEvents } from '@/services/eventService'
import { getAttendance } from '@/services/attendanceService'

export default function AttendancePage() {
	const [events, setEvents] = useState([])
	const [eventId, setEventId] = useState('')
	const [records, setRecords] = useState([])
	const selectedEvent = useMemo(() => events.find((event) => event.id === eventId) || null, [events, eventId])
	const [isLoading, setIsLoading] = useState(false)
	const [courseFilter, setCourseFilter] = useState('all')
	const [searchInput, setSearchInput] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [isFormOpen, setIsFormOpen] = useState(false)
	const [isImportOpen, setIsImportOpen] = useState(false)
	const pageSize = 10

	const loadAttendance = async (selectedEventId = eventId) => {
		if (!selectedEventId) return
		setIsLoading(true)
		const result = await getAttendance(selectedEventId)
		setRecords(result.error ? [] : result.data)
		setIsLoading(false)
	}

	useEffect(() => {
		getEvents().then((result) => {
			const nextEvents = result.data || []
			setEvents(nextEvents)
			if (nextEvents[0]) setEventId(nextEvents[0].id)
		})
	}, [])

	useEffect(() => {
		if (!eventId) return
		getAttendance(eventId).then((result) => setRecords(result.error ? [] : result.data))
	}, [eventId])

	const courseOptions = useMemo(() => Array.from(new Set(records.map((record) => record.course).filter(Boolean))).sort((a, b) => a.localeCompare(b)), [records])
	const filteredRecords = useMemo(() => {
		const query = searchTerm.trim().toLowerCase()
		return records.filter((record) => {
			const matchesCourse = courseFilter === 'all' || record.course === courseFilter
			const name = `${record.first_name} ${record.middle_initial || ''} ${record.last_name}`.toLowerCase()
			const matchesSearch = !query || [record.student_code, name, record.course, record.section].join(' ').toLowerCase().includes(query)
			return matchesCourse && matchesSearch
		})
	}, [records, courseFilter, searchTerm])
	const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize))
	const paginatedRecords = useMemo(() => filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filteredRecords, currentPage])

	useEffect(() => { setCurrentPage(1) }, [eventId, courseFilter, searchTerm])

	const exportList = () => {
		const escapeCsv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
		const manilaDate = (value) => value ? new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : ''
		const rows = [
			['Student ID', 'Name', 'Course', 'Year', 'Section', 'Time In (PHT)', 'Time Out (PHT)'],
			...records.map((record) => [record.student_code, `${record.first_name} ${record.middle_initial ? `${record.middle_initial}. ` : ''}${record.last_name}`, record.course, record.year_level, record.section, manilaDate(record.time_in), manilaDate(record.time_out)]),
		]
		const blob = new Blob([rows.map((row) => row.map(escapeCsv).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = 'attendance-list.csv'
		link.click()
		URL.revokeObjectURL(url)
	}

	return <MainLayout><Toaster position="top-right" /><main className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-10">
		<div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Attendance</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Time in and time out</h1><p className="mt-2 text-sm text-slate-500">Times are recorded by the server and displayed in Philippine time.</p></div><div className="flex flex-wrap items-center gap-2"><label className="text-sm font-medium text-slate-700">Event <select value={eventId} onChange={(event) => setEventId(event.target.value)} className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"><option value="">Choose an event</option>{events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}</select></label><button type="button" onClick={() => setIsImportOpen(true)} disabled={!eventId} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><Upload size={16} />Import</button><button type="button" onClick={() => setIsFormOpen(true)} disabled={!eventId} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><Plus size={16} />Add student</button><button type="button" onClick={exportList} disabled={!eventId || records.length === 0} title="Export all attendance records" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><Download size={16} />Export</button><button type="button" onClick={() => loadAttendance()} title="Refresh attendance" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"><RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} /></button></div></div>
		{eventId ? <AttendanceTable records={paginatedRecords} allRecordsCount={filteredRecords.length} totalRecords={records.length} eventId={eventId} event={selectedEvent} onRefresh={() => loadAttendance()} isLoading={isLoading} courseFilter={courseFilter} onCourseFilterChange={setCourseFilter} courseOptions={courseOptions} searchInput={searchInput} onSearchInputChange={(value) => { setSearchInput(value); setSearchTerm(value) }} onSearchSubmit={(event) => { event.preventDefault(); setSearchTerm(searchInput) }} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /> : <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">Create an event and assign students before recording attendance.</div>}
		{isFormOpen && <StudentForm eventId={eventId} onClose={() => setIsFormOpen(false)} onSaved={() => loadAttendance()} />}
		{isImportOpen && <ImportModal eventId={eventId} onClose={() => setIsImportOpen(false)} onImported={() => loadAttendance()} />}
	</main></MainLayout>
}
