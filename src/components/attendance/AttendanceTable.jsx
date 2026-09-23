import { RefreshCw, Search } from 'lucide-react'
import TimeInOut from '@/components/attendance/TimeInOut'

const manilaTime = (value) => value
	? new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
	: 'Not recorded'

export default function AttendanceTable({ records, allRecordsCount, totalRecords, eventId, event, onRefresh, isLoading, courseFilter, onCourseFilterChange, courseOptions, searchInput, onSearchInputChange, onSearchSubmit, currentPage, totalPages, onPageChange }) {
	const safeTotalPages = Math.max(1, totalPages)
	return (
		<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
			<div className="border-b border-slate-100 p-6"><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><h2 className="text-lg font-semibold text-slate-950">Attendance records</h2><p className="mt-1 text-sm text-slate-500">{allRecordsCount} match{allRecordsCount === 1 ? '' : 'es'} · {totalRecords} total records</p></div><div className="flex flex-wrap items-center gap-3"><label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"><span className="font-medium">Course</span><select value={courseFilter} onChange={(event) => onCourseFilterChange(event.target.value)} className="border-0 bg-transparent text-sm outline-none"><option value="all">All courses</option>{courseOptions.map((course) => <option key={course} value={course}>{course}</option>)}</select></label><form onSubmit={onSearchSubmit} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><Search size={15} className="text-slate-500" /><input value={searchInput} onChange={(event) => onSearchInputChange(event.target.value)} placeholder="Search students..." className="w-48 border-0 bg-transparent text-sm outline-none placeholder:text-slate-400" /><button type="submit" className="rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700">Search</button></form><button type="button" onClick={onRefresh} title="Refresh attendance" className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} /></button></div></div></div>
			<div className="overflow-x-auto">
				<table className="w-full text-left text-sm">
					<thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-6 py-3">Student</th><th className="px-6 py-3">Email</th><th className="px-6 py-3">Course</th><th className="px-6 py-3">Time in (PHT)</th><th className="px-6 py-3">Time out (PHT)</th><th className="px-6 py-3">Actions</th></tr></thead>
					<tbody className="divide-y divide-slate-100">
							{records.length === 0 ? <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500">No students are assigned to this event.</td></tr> : records.map((student) => (
							<tr key={student.student_id} className="hover:bg-slate-50">
								<td className="px-6 py-4"><p className="font-medium text-slate-900">{student.first_name} {student.middle_initial ? `${student.middle_initial}. ` : ''}{student.last_name}</p><p className="font-mono text-xs text-slate-500">{student.student_code}</p></td>
								<td className="px-6 py-4 font-mono text-xs lowercase text-slate-600">{student.email || `${(student.last_name || '').trim().replace(/\s+/g, '').toLowerCase()}.${String(student.student_code || '').trim().toLowerCase()}@alabang.sti.edu.ph`}</td>
								<td className="px-6 py-4 text-slate-600">{student.course} · Year {student.year_level}-{student.section}</td>
								<td className="px-6 py-4 text-slate-600">{manilaTime(student.time_in)}</td>
								<td className="px-6 py-4 text-slate-600">{manilaTime(student.time_out)}</td>
								<td className="px-6 py-4"><TimeInOut student={student} eventId={eventId} event={event} onChanged={onRefresh} /></td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			{isLoading && <p className="border-t border-slate-100 px-6 py-3 text-xs text-slate-500">Refreshing attendance...</p>}
			<div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4"><div className="text-sm text-slate-500">Page {Math.min(currentPage, safeTotalPages)} of {safeTotalPages}</div><div className="flex items-center gap-2"><button type="button" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Prev</button>{Array.from({ length: safeTotalPages }, (_, index) => index + 1).map((page) => <button key={page} type="button" onClick={() => onPageChange(page)} className={`h-8 min-w-8 rounded-lg px-2 text-sm font-medium ${page === currentPage ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'}`}>{page}</button>)}<button type="button" onClick={() => onPageChange(Math.min(safeTotalPages, currentPage + 1))} disabled={currentPage >= safeTotalPages} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Next</button></div></div>
		</div>
	)
}
