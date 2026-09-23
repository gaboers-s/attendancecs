import { Edit2, RefreshCw, Search, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { deleteStudent } from '@/services/studentService'

export default function StudentTable({
  students,
  allStudentsCount,
  totalStudents,
  isLoading,
  onEdit,
  onRefresh,
  selectedEvent,
  eventOptions,
  onEventChange,
  courseFilter,
  onCourseFilterChange,
  courseOptions,
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  currentPage,
  totalPages,
  onPageChange,
}) {
  const handleDelete = async (student) => {
    if (!window.confirm(`Delete ${student.first_name} ${student.last_name}?`)) return

    const result = await deleteStudent(student.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Student deleted')
      onRefresh()
    }
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
  const safeTotalPages = Math.max(1, totalPages)

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Students</h2>
            <p className="mt-1 text-sm text-slate-500">
              {selectedEvent ? `Event: ${selectedEvent.title}` : 'Choose an event'} · {allStudentsCount} match{allStudentsCount === 1 ? '' : 'es'} · {totalStudents} total records
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <span className="font-medium">Course</span>
              <select
                value={courseFilter}
                onChange={(event) => onCourseFilterChange(event.target.value)}
                className="border-0 bg-transparent text-sm text-slate-700 outline-none"
              >
                <option value="all">All courses</option>
                {courseOptions.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </label>

            <form onSubmit={onSearchSubmit} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <Search size={15} className="text-slate-500" />
              <input
                type="text"
                value={searchInput}
                onChange={(event) => onSearchInputChange(event.target.value)}
                placeholder="Search globally..."
                className="w-52 border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                Search
              </button>
            </form>

            <button
              type="button"
              title="Refresh"
              onClick={onRefresh}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3">Student ID</th>
              <th className="px-6 py-3">Full Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Course</th>
              <th className="px-6 py-3">Year/Section</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                  {allStudentsCount === 0
                    ? 'No students match the current course filter or search.'
                    : 'No students on this page.'}
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-mono font-medium text-slate-900">{student.student_id}</td>
                  <td className="px-6 py-4 text-slate-900">
                    {student.first_name} {student.middle_initial ? `${student.middle_initial}.` : ''} {student.last_name}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-xs lowercase">{student.email || `${(student.last_name || '').trim().replace(/\s+/g, '').toLowerCase()}.${String(student.student_id || '').trim().toLowerCase()}@alabang.sti.edu.ph`}</td>
                  <td className="px-6 py-4 text-slate-600">{student.course}</td>
                  <td className="px-6 py-4 text-slate-600">
                    Year {student.year_level} - Section {student.section}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(student)}
                        className="rounded p-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(student)}
                        className="rounded p-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
        <div className="text-sm text-slate-500">
          Page {Math.min(currentPage, safeTotalPages)} of {safeTotalPages}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>

          {pageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`h-8 min-w-8 rounded-lg px-2 text-sm font-medium ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(Math.min(safeTotalPages, currentPage + 1))}
            disabled={currentPage >= safeTotalPages}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
